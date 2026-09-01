const { handleAIChat } = require('../services/aiAssistantService');

/**
 * AI Travel Assistant Conversation Endpoint
 */
const chatWithAssistant = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message string is required.' });
    }

    const response = await handleAIChat(message, context || {});
    res.json({ success: true, ...response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  chatWithAssistant
};
