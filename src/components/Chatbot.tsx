import '../App.css';
import { useState, useRef, useEffect } from 'react';
import { FaArrowAltCircleUp, FaHome, FaEnvelope } from "react-icons/fa";
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { FaChevronRight } from 'react-icons/fa';
import { MessageCircle, ChevronRight,HelpCircle } from 'lucide-react';

type Message = {
  type: 'bot' | 'user';
  text: string;
  feedback: string | null;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [screen, setScreen] = useState<'chat' | 'intro'>('chat');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [botBusy, setBotBusy] = useState(false);

  const [userId] = useState(() => {
    const existing = sessionStorage.getItem("user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem("user_id", random);
    return random;
  });

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [userId]);

  const userName = (sessionStorage.getItem("chat_name") || "Guest").charAt(0).toUpperCase() + (sessionStorage.getItem("chat_name") || "Guest").slice(1);

  const helpOptions = [
    "About Baker's Elite Remodeling",
    "Services & Solutions",
    "Pricing & Plans",
    "Contact Human Support"
  ];

  useEffect(() => {
    if (isOpen) {
      const nameStored = sessionStorage.getItem("chat_name");
      const emailStored = sessionStorage.getItem("chat_email");
      if (nameStored && emailStored) {
        setScreen("chat");
      } else {
        setScreen("chat");
      }
    }
  }, [isOpen]);

  const handleBotResponse = async (userMessage: string) => {
    setBotBusy(true);
    setTypingMessage("Adam is typing...");

    try {
      const res = await fetch("https://auto.robogrowthpartners.com/webhook/barker-elite-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: userMessage })
      });

      const data = await res.json();
      const replies = (data.reply || "").split("\\k").filter((part: string) => part.trim() !== "");

      for (let i = 0; i < replies.length; i++) {
        setTypingMessage("Adam is typing...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTypingMessage(null);
        setMessages(prev => [...prev, { type: 'bot', text: replies[i].trim(), feedback: null }]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch {
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: "Oops! Something went wrong.", feedback: null }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => {
          handleBotResponse(nextMessage);
        }, 2000);
      }
      return rest;
    });
  };

  useEffect(() => {
  const alreadyShown = sessionStorage.getItem("default_message_shown");

  if (!alreadyShown) {
    setMessages([
      {
        type: "bot",
        text: "Hi! This is Bakers Elite Remodeling. How we can help you with today?",
        feedback: null
      }
    ]);

    sessionStorage.setItem("default_message_shown", "true");
  }
}, []);


const faqData = [
  {
    question: "What kinds of remodeling services do you offer?",
    answer: "We offer full-service home and commercial remodeling including custom kitchen & bathroom makeovers, flooring and tile installation, deck/fence construction, patios and hardscaping, siding and exterior work, window/door installation, and even home additions."
  },
  {
    question: "Do you provide free consultations and project estimates?",
    answer: "Yes — we offer free consultations and provide a detailed estimate that outlines labor, materials, timeline, and any potential additional costs before you commit."
  },
  {
    question: "How long does a typical remodeling project take?",
    answer: "Project timelines vary depending on scope — a simple bathroom remodel may take a few days, while major kitchen or full-home renovations could take several weeks. We always give you a realistic schedule up front."
  },
  {
    question: "Are your contractors licensed and insured?",
    answer: "Absolutely. All our teams are fully licensed and insured, and we follow best practices to ensure safety, quality workmanship, and peace of mind for you."
  },
  {
    question: "Can I choose my own materials, fixtures, and finishes?",
    answer: "Yes — during the consultation and planning phase we let you pick materials, finishes, cabinets, floor types, tiles, etc., to match your style and budget."
  },
  {
    question: "What if unexpected problems come up during renovation?",
    answer: "Homes sometimes have hidden issues (wiring, plumbing, structural). If that happens, we’ll inform you early, explain the problem and extra cost (if any), and get your approval before proceeding."
  },
  {
    question: "Do you offer a warranty or guarantee on workmanship and materials?",
    answer: "Yes — we stand by our work. We provide a workmanship warranty, and if any defect arises because of our work, we’ll fix it. For materials, we honor manufacturer warranties whenever applicable."
  },
  {
    question: "How do you handle payment schedules and deposits?",
    answer: "We typically break payment into phases — a deposit before work begins, progress payments during the project, and final payment upon completion. We’ll share a full breakdown in the estimate so you know exactly what to expect."
  },
  {
    question: "Will my home be protected and cleaned during renovation?",
    answer: "Yes. Our crew follows clean-up protocols every day: covering furniture/flooring, sealing work areas if needed, removing debris, and cleaning work spaces before leaving, to minimize disruption and dust."
  },
  {
    question: "How do I start — how do I request a quote or book a project?",
    answer: "Simply contact us via phone or the contact form on our website, tell us what you need (kitchen, bath, deck, etc.), and we’ll schedule a free consultation — we’ll walk you through the process from design to project plan, estimate, and timeline."
  }
];

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: message, feedback: null }]);

    if (botBusy) {
      setMessageQueue(prev => [...prev, message]);
    } else {
      await handleBotResponse(message);
    }
  };

  const handleHelpClick = (prompt: string) => {
    setScreen("chat");
    handleBotResponse(prompt);
  };

  const handleFormSubmit = () => {
    setScreen("chat");
    const pendingPrompt = sessionStorage.getItem("pending_prompt");
    const firstMessage = `User info: Name = ${name}, Email = ${email}${pendingPrompt ? `\n\n${pendingPrompt}` : ""}`;
    handleBotResponse(firstMessage);

    sessionStorage.removeItem("pending_prompt");

  };

  // Function to handle direct messaging without form
  const [firstMessageSent, setFirstMessageSent] = useState(() => {
    return sessionStorage.getItem("first_message_sent") === "true";
  });

  const handleDirectMessage = () => {
    setScreen("chat");

    if (firstMessageSent) return; // prevent re-sending

    const storedName = sessionStorage.getItem("chat_name");
    const storedEmail = sessionStorage.getItem("chat_email");

    if (!storedName || !storedEmail) {
      handleBotResponse("Hello, I'd like to start a conversation.");
    }

    setFirstMessageSent(true);
    sessionStorage.setItem("first_message_sent", "true");
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            bottom: '-0px',
            right: '0px',
            zIndex: 10000,
          }}
        >
          <Card style={{ width: '400px', height: '620px', display: 'flex', flexDirection: 'column', borderRadius: "30px", overflow: "hidden" }}>

            {/* Modern Header */}

            <div className={screen === 'intro' ? '' : ''} style={{
              background: "linear-gradient(135deg, #848484ff, #000000ff)",
              padding: '20px',
              paddingTop: "20px",
              color: 'white',
              minHeight: "100px"
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>

                <img
                  src="./logo.png"
                  alt="Chatbot Logo"
                  style={{
                    width: "250px",
                    height: "50px",
                    // borderRadius: "50%",
                    paddingTop: " 0px",
                    marginTop: "20px",
                    objectFit: "cover",
                    marginRight: "10px"
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              </div>
              <>

                <p style={{ margin: 0, fontSize: 14, paddingTop: '5px' }}>
                  I am <b>Reno AI</b> from <b>Barker Elite Remodeling.</b><br />How can we help?
                </p>
              </>




            </div>

            {/* Main Body */}
            <Card.Body style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>

              {screen === 'intro' && (
                <div style={{ padding: "10px" }}>

                  {/* Quick Actions */}


                  {/* FAQ Title */}
                  <h6 style={{
                    fontWeight: "600",
                    marginBottom: "10px",
                    marginTop: "15px",
                    paddingLeft: "5px"
                  }}>
                    Frequently Asked Questions
                  </h6>

                  {/* FAQ Section */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    {faqData.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        style={{
                          background: "#ffffff",
                          borderRadius: "16px",
                          padding: "12px",
                          border: "1px solid #f0f0f0",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                        }}
                      >
                        <strong style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>
                          {faq.question}
                        </strong>

                        <p style={{
                          fontSize: "13px",
                          color: "#555",
                          lineHeight: "1.45",
                          marginBottom: 0
                        }}>
                          {faq.answer}
                        </p>

                        <button
                          onClick={() => handleHelpClick(faq.question)}
                          style={{
                            marginTop: "8px",
                            border: "none",
                            background: "transparent",
                            color: "#000",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Ask this <MessageCircle size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                </div>
              )}




              {screen === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
                    {messages.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>

                        <div style={{
                          maxWidth: '75%',
                          paddingLeft: '13px',
                          paddingTop: '14px',
                          paddingRight: '13px',
                          borderRadius: '10px',
                          color: msg.type === 'user' ? 'white' : 'black',
                          background: msg.type === 'user' ? 'linear-gradient(135deg, #848484ff, #000000ff)' : '#f1f1f1',
                          fontSize: "14px"
                        }}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {typingMessage && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <img src="./chatbot.gif" alt="Bot" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '50%', backgroundColor: 'black' }} />
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    display: 'flex',
                    padding: '8px',
                    boxShadow: "0 -4px 10px -4px #dfdfdf8a",
                    background: '#fff'
                  }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      style={{
                        marginLeft: '8px',
                        borderRadius: '50%',
                        background: "linear-gradient(135deg, #848484ff, #000000ff)",
                        width: '40px',
                        border: "none",
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaArrowAltCircleUp size={20} />
                    </Button>
                  </div>
                </div>
              )}




            </Card.Body>

            <Card.Footer
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
                borderTop: '1px solid #ddd',
                background: '#f8f9fa',
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 500,
                boxShadow: (screen === 'intro') ? "0 5px 10px #b3b3b3ff" : "none"
              }}
            >
              {[
                { icon: FaEnvelope, label: 'Chat', screenName: 'chat' },

                { icon: HelpCircle, label: "FAQ", screenName: 'intro' },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = screen === item.screenName;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: isActive ? '#000000ff' : '#555',
                      padding: '5px 10px',
                      borderRadius: '8px'
                    }}
                    onClick={() => {
                      if (item.screenName === 'chat') {
                        // Go directly to chat without requiring form
                        handleDirectMessage();
                      } else if (item.screenName) {
                        setScreen(item.screenName);
                      }
                    }}
                  >
                    <Icon size={22} style={{ transition: 'color 0.3s ease' }} />
                    <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
                  </motion.div>
                );
              })}
            </Card.Footer>

          </Card>
        </motion.div>
      )}
    </>
  );
};

export default Chatbot; 