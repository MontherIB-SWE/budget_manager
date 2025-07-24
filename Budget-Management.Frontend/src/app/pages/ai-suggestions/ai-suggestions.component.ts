import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { of }                  from 'rxjs';
import { catchError }          from 'rxjs/operators';

import { AiService }           from '../../services/ai.service';
import { UserService }         from '../../services/user.service';
import { TransactionService }  from '../../services/transaction.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';  
import { AISuggestion }        from '../../core/models/ai-suggestion.model';
import { User }                from '../../core/models/user.model';
import { Transaction }         from '../../core/models/transaction.model';

/**
 * Component for handling AI-powered financial suggestions.
 * Displays UI for automatic and custom prompts, shows loading state,
 * and manages history of past suggestions.
 */
@Component({
  selector   : 'app-ai-suggestions',
  standalone : true,
  imports    : [CommonModule, FormsModule, NgxSpinnerModule],
  templateUrl: './ai-suggestions.component.html',
  styleUrls  : ['./ai-suggestions.component.css']
})
export class AiSuggestionsComponent implements OnInit {

  // Bound to the textarea for custom user prompts
  userPrompt  = '';
  // Stores the current AI response to display
  aiResponse  = '';
  // Tracks whether a request is in progress
  isLoading   = false;
  // Flags if the current prompt is custom (vs automatic)
  isCustom    = false;
  // Holds any error message for display
  error: string | null = null;
  // Index of expanded history item, or null if none
  expandedIndex: number | null = null;

  // List of past AI suggestions for the current user
  pastSuggestions: AISuggestion[] = [];

  // Cached current user data
  private currentUser: User | null = null;

  /**
   * Injects necessary services: AI, User, Transaction, and Spinner.
   */
  constructor(
    private aiService         : AiService,
    private userService       : UserService,
    private transactionService: TransactionService,
    private spinner           : NgxSpinnerService          
  ) {}

  /**
   * On component init, load current user and their suggestion history.
   */
  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next  : user => {
        this.currentUser = user;
        if (user?.id) {
          // Load history once user ID is available
          this.loadPastSuggestions(String(user.id));
        }
      },
      error : err => {
        console.error(err);
        this.error = 'Could not load user data. AI suggestions may be inaccurate.';
      }
    });
  }

  /**
   * Toggles expansion of a history item at index i.
   * @param i - index of the clicked history entry
   */
  toggleExpand(i: number): void {
    this.expandedIndex = this.expandedIndex === i ? null : i;
  }

  /**
   * Initiates an automatic suggestion (no custom prompt).
   */
  getAutomaticSuggestion(): void {
    this.isCustom = false;
    this.fetchDataAndGeneratePrompt();
  }

  /**
   * Initiates a custom suggestion using the user's prompt.
   * Returns early if prompt is empty.
   */
  getCustomSuggestion(): void {
    if (!this.userPrompt.trim()) return;
    this.isCustom = true;
    this.fetchDataAndGeneratePrompt();
  }

  /**
   * Core method: fetches transaction data, shows loader, builds prompt,
   * and sends it to AI service.
   */
  private fetchDataAndGeneratePrompt(): void {
    if (!this.currentUser?.id) {
      this.error = 'User not identified. Please log in again.';
      return;
    }

    // Reset UI state and show spinner
    this.isLoading = true;
    this.error     = null;
    this.aiResponse = '';
    this.spinner.show('ai');

    // Fetch transactions and handle errors gracefully
    this.transactionService.getTransactions().pipe(
      catchError(err => {
        console.error(err);
        this.error = 'Could not fetch transaction data.';
        return of([] as Transaction[]);
      })
    ).subscribe(transactions => {
      const prompt = this.buildPrompt(transactions);
      this.callAiService(prompt, String(this.currentUser!.id));
    });
  }

  /**
   * Constructs the final prompt string based on transactions and user info.
   * @param transactions - list of transactions to include in context
   * @returns the composed prompt text
   */
  private buildPrompt(transactions: Transaction[]): string {
    const user = this.currentUser!;
    const avgIncome = Number(user.averageIncome);
    const avgStr = isNaN(avgIncome) ? 'Not set' : `$${avgIncome.toFixed(2)}`;
    const userInfo = `User Name: ${user.name || 'N/A'}\nAverage Income: ${avgStr}`;
    const txText   = this.formatTransactionsForPrompt(transactions);

    const context  = `Here is the user's financial data:\n${userInfo}\n\nRecent Transactions:\n${txText}`;

    if (this.isCustom) {
      return `${context}\n\nAnswer the user's question concisely: "${this.userPrompt}"`;
    }

    return `${context}

---
TASK: Provide a concise financial analysis.

OUTPUT REQUIREMENTS:
- PLAIN TEXT, no markdown.
- Keep it short; focus on the top 2–3 findings.

SECTIONS:
SPENDING OVERVIEW:
KEY SAVING OPPORTUNITY:
ACTION PLAN:
POTENTIAL SAVINGS:
`;
  }

  /**
   * Formats a list of transactions into bullet points for the prompt.
   * @param list - array of transactions
   * @returns string of formatted lines
   */
  private formatTransactionsForPrompt(list: Transaction[]): string {
    if (!list?.length) return 'No transaction data available.';
    return list.map(t =>
      `- ${new Date(t.date).toLocaleDateString()}: ${t.type === 'expense' ? 'Spent' : 'Received'} $${t.amount.toFixed(2)}${t.description ? ' for ' + t.description : ''}${t.categoryId ? ' (category ' + t.categoryId + ')' : ''}.`
    ).join('\n');
  }

  /**
   * Sends the prompt to the AI service and handles the response.
   * @param prompt - the final prompt string
   * @param userId - current user ID
   */
  private callAiService(prompt: string, userId: string): void {
    this.aiService.generateSuggestion(prompt, userId).subscribe({
      next  : saved => {
        this.aiResponse = saved.response;
        this.loadPastSuggestions(userId);
        this.stopLoading();
      },
      error : err => {
        console.error(err);
        this.error = 'AI request failed. Please try again.';
        this.stopLoading();
      }
    });
  }

  /**
   * Loads the past suggestions from the AI service and sorts them by date.
   * @param userId - current user ID
   */
  private loadPastSuggestions(userId: string): void {
    this.aiService.getSuggestionHistory(userId).subscribe({
      next  : list => {
        this.pastSuggestions = list.sort(
          (a, b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime()
        );
      },
      error : err => console.error('Failed to load history', err)
    });
  }

  /**
   * Stops the loading state and hides the spinner.
   */
  private stopLoading(): void {
    this.isLoading = false;
    this.spinner.hide('ai');
  }
}
