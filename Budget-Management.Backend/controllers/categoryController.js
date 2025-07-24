const Category = require('../models/Category');
const { Op } = require('sequelize');

/**
 * Handler to fetch categories for a given user.
 * Returns both global (userId null) and user-specific categories.
 */
exports.getCategories = async (req, res) => {
    try {
        // Extract userId from query parameters
        const { userId } = req.query;
        if (!userId) {
            // Bad request if userId is missing
            return res.status(400).json({ error: 'A userId query parameter is required.' });
        }

        // Fetch categories where userId is null (global) or matches provided userId
        const categories = await Category.findAll({
            where: {
                [Op.or]: [
                    { userId: null },           // global category
                    { userId: userId }          // user-specific category
                ]
            }
        });

        // Return the list of categories as JSON
        res.json(categories);
    } catch (err) {
        // Internal server error on exception
        res.status(500).json({ error: err.message });
    }
};

/**
 * Handler to create a new category for a user.
 * Expects `name` and `userId` in the request body.
 */
exports.createCategory = async (req, res) => {
    try {
        const { name, userId } = req.body;
        if (!name || !userId) {
            // Validate required fields
            return res.status(400).json({ error: 'Both name and userId are required.' });
        }

        // Create and persist the new category
        const category = await Category.create({ name, userId });
        // Respond with the created category and 201 status
        res.status(201).json(category);
    } catch (err) {
        // Bad request on validation or creation error
        res.status(400).json({ error: err.message });
    }
};

/**
 * Handler to delete a category.
 * Requires category ID in URL params and userId in query to verify ownership.
 */
exports.deleteCategory = async (req, res) => {
    try {
        // Extract path and query parameters
        const categoryId = req.params.id;
        const { userId } = req.query;

        if (!userId) {
            // Must specify userId to authorize deletion
            return res.status(400).json({ error: 'A userId query parameter is required to verify ownership.' });
        }

        // Find the category by its primary key
        const category = await Category.findOne({ where: { id: categoryId } });

        if (!category) {
            // Category not found
            return res.status(404).json({ error: 'Category not found.' });
        }
        if (category.userId !== parseInt(userId)) {
            // Prevent deletion if the category does not belong to the user
            return res.status(403).json({ error: 'You do not have permission to delete this category.' });
        }

        // Perform the delete operation
        await category.destroy();
        // Send 204 No Content on success
        res.status(204).send();
    } catch (err) {
        // Internal server error on exception
        res.status(500).json({ error: err.message });
    }
};
