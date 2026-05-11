// delivery/pages/DeliverySupport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  MessageCircle, 
  Plus, 
  Send, 
  Loader, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Bot,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliverySupport = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { value: 'all', label: 'All', icon: AlertCircle },
    { value: 'order', label: 'Orders', icon: FileText },
    { value: 'payment', label: 'Payments', icon: MessageCircle },
    { value: 'delivery', label: 'Delivery', icon: Headphones },
    { value: 'account', label: 'Account', icon: Mail },
    { value: 'general', label: 'General', icon: Sparkles }
  ];

  useEffect(() => {
    fetchSupportData();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [faqs, searchTerm, activeCategory]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSupportData = async () => {
    try {
      const [faqsRes, ticketsRes] = await Promise.all([
        API.get('/delivery/support/faqs').catch(() => ({ data: {} })),
        API.get('/delivery/support/tickets').catch(() => ({ data: {} }))
      ]);
      
      const faqsData = faqsRes.data?.faqs || faqsRes.data?.data || [];
      const ticketsData = ticketsRes.data?.tickets || ticketsRes.data?.data || [];
      
      setFaqs(Array.isArray(faqsData) ? faqsData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error) {
      console.error('Error fetching support data:', error);
      toast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const filterFaqs = () => {
    let filtered = [...faqs];
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question?.toLowerCase().includes(term) ||
        faq.answer?.toLowerCase().includes(term) ||
        faq.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredFaqs(filtered);
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      await API.post('/delivery/support/ticket', { 
        subject, 
        message,
        category 
      });
      toast.success('Ticket created successfully! We\'ll respond within 24 hours.');
      setSubject('');
      setMessage('');
      setCategory('general');
      setShowTicketForm(false);
      fetchSupportData();
    } catch (error) {
      console.error('Ticket creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { text: chatInput, sender: 'user', timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse = { 
        text: getBotResponse(chatInput), 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, botResponse]);
      setChatLoading(false);
    }, 1000);
  };

  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('delivery') || q.includes('order')) {
      return "You can view and manage your deliveries from the Orders page. Need help with a specific order?";
    }
    if (q.includes('payment') || q.includes('earnings')) {
      return "Your earnings are updated after each successful delivery. Check the Earnings page for detailed breakdown.";
    }
    if (q.includes('profile') || q.includes('update')) {
      return "You can update your profile information, vehicle details, and bank account from the Profile page.";
    }
    return "Thanks for reaching out! Our support team will assist you shortly. You can also create a support ticket for complex issues.";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Loader },
      resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };
    const cfg = config[status] || config.open;
    const Icon = cfg.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.color}`}>
        <Icon size={10} />
        {cfg.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      order: 'bg-blue-100 text-blue-700',
      payment: 'bg-green-100 text-green-700',
      delivery: 'bg-purple-100 text-purple-700',
      account: 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading support center...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Support Center</h1>
            <p className="text-orange-100 mt-1">Get help and support from our team</p>
          </div>
          <button
            onClick={() => setShowTicketForm(true)}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            New Ticket
          </button>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageCircle size={24} className="text-green-600" />
          </div>
          <h3 className="font-semibold">Live Chat</h3>
          <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
          <button
            onClick={() => setChatOpen(true)}
            className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Start Chat →
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Mail size={24} className="text-blue-600" />
          </div>
          <h3 className="font-semibold">Email Support</h3>
          <p className="text-sm text-gray-500 mt-1">Response within 24h</p>
          <button
            onClick={() => copyToClipboard('support@quickbite.com')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            support@quickbite.com
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Phone size={24} className="text-orange-600" />
          </div>
          <h3 className="font-semibold">Call Support</h3>
          <p className="text-sm text-gray-500 mt-1">Mon-Sat, 9AM-6PM</p>
          <button
            onClick={() => window.location.href = 'tel:+911234567890'}
            className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Call Now →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-8">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
            🚚 Track Order
          </button>
          <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
            💰 Earnings Issue
          </button>
          <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
            📍 Location Problem
          </button>
          <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
            🔐 Account Issue
          </button>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="px-4 py-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertCircle size={18} />
              Frequently Asked Questions
            </h2>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition ${
                  activeCategory === cat.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="divide-y">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p>No FAQs found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            filteredFaqs.map(faq => (
              <div key={faq._id} className="border-b last:border-0">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{faq.question}</p>
                    {faq.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getCategoryBadge(faq.category)}`}>
                        {faq.category}
                      </span>
                    )}
                  </div>
                  {expandedFaq === faq._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFaq === faq._id && (
                  <div className="px-4 pb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                      <div className="flex gap-3 mt-3">
                        <button className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                          <ThumbsUp size={12} /> Helpful
                        </button>
                        <button className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                          <ThumbsDown size={12} /> Not Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Tickets */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText size={18} />
            My Support Tickets
            <span className="text-sm text-gray-500 ml-2">({tickets.length})</span>
          </h2>
        </div>
        <div className="divide-y">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p>No tickets yet</p>
              <p className="text-sm">Create a ticket for any issues you face</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{ticket.subject}</p>
                      {ticket.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadge(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{ticket.message}</p>
                    {ticket.response && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Support Response:</p>
                        <p className="text-sm text-gray-600">{ticket.response}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(ticket.status)}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTicketForm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Support Ticket</h3>
              <button onClick={() => setShowTicketForm(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setChatOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot size={20} />
                  <h3 className="font-semibold">QuickBite Support</h3>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>
              <p className="text-xs text-orange-100 mt-1">Usually replies in a few seconds</p>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-8">
                  <MessageCircle size={32} className="mx-auto mb-2" />
                  <p>Hello! How can I help you today?</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-orange-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This is an AI-powered assistant. For complex issues, please create a support ticket.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySupport;