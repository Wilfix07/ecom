import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { aiChatbotService } from '../services/aiChatbotService';
import { Button } from './ui/button';
import { Card } from './ui/card';

const CustomerSupportChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const result = await chatService.getConversations(user.id);
    if (result.success) {
      setConversations(result.data);
      
      // Auto-open first open conversation or create new one
      const openConv = result.data.find(c => c.status === 'open');
      if (openConv) {
        setConversationId(openConv.id);
      } else {
        createNewConversation();
      }
    }
  };

  const createNewConversation = async () => {
    const result = await chatService.createConversation(user.id, 'Customer Support');
    if (result.success) {
      setConversationId(result.data.id);
      setConversations([result.data, ...conversations]);
    }
  };

  const loadMessages = async () => {
    const result = await chatService.getMessages(conversationId);
    if (result.success) {
      setMessages(result.data);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      sender_type: 'user',
      message: inputMessage,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setTyping(true);

    // Send user message
    await chatService.sendMessage(conversationId, user.id, inputMessage, 'user');

    // Get AI response
    const aiResponse = await aiChatbotService.getResponse(inputMessage);
    
    // Create bot message
    const botMessage = {
      id: `bot-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: 'bot',
      sender_type: 'bot',
      message: aiResponse.response,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
    setTyping(false);

    // Send bot message to database
    await chatService.sendMessage(conversationId, 'bot', aiResponse.response, 'bot');

    // If AI suggests escalation, offer live agent
    if (aiResponse.type === 'escalate') {
      setTimeout(() => {
        const escalationMessage = {
          id: `bot-${Date.now() + 1}`,
          conversation_id: conversationId,
          sender_id: 'bot',
          sender_type: 'bot',
          message: 'Vle ou pale ak yon ajan kliyan aktyèl? Ki pou m ka konekte ou ak yon moun k ap ka ede ou.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, escalationMessage]);
        chatService.sendMessage(conversationId, 'bot', escalationMessage.message, 'bot');
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-all"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed bottom-4 right-4 w-96 max-h-[600px] flex flex-col shadow-2xl z-50 ${isMinimized ? 'hidden' : ''}`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <span className="font-semibold">Kontwi Depatman Kliyan</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot size={48} className="mx-auto mb-2 text-gray-400" />
                <p>Bonjou! Kouman mwen ka ede ou jodi a?</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender_type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {typing && (
              <div className="flex gap-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Klike mesaj ou isi..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                size="icon"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Customer Support
        </button>
      )}
    </>
  );
};

export default CustomerSupportChat;

