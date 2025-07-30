"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import IntegrationCard from "@/components/knowledge-integration/IntegrationCard";
import ProgressIndicator from "@/components/knowledge-integration/ProgressIndicator";
import SearchDemo from "@/components/knowledge-integration/SearchDemo";
import { 
  Github, 
  FileText, 
  Calendar, 
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  ExternalLink
} from 'lucide-react';

const KnowledgeIntegration = () => {
  const [connectedSources, setConnectedSources] = useState([]);
  const [connectingStates, setConnectingStates] = useState({});
  const [userIntegrations, setUserIntegrations] = useState({});

  // Check for existing connections on component mount
  useEffect(() => {
    const sources = ['google-drive', 'notion', 'jira'];
    const integrations = {};
    const connected = [];

    sources.forEach(source => {
      const tokens = localStorage.getItem(`${source}_tokens`);
      if (tokens) {
        integrations[source] = JSON.parse(tokens);
        connected.push(source);
      }
    });

    setUserIntegrations(integrations);
    setConnectedSources(connected);
  }, []);

  const sources = [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Connect your Google Drive to search through files and documents",
      icon: FileText,
      color: "bg-green-500",
      status: "connected"
    },
    {
      id: "notion",
      name: "Notion",
      description: "Connect your Notion workspace to search through pages and databases",
      icon: Database,
      color: "bg-black",
      status: "available"
    },
    {
      id: "jira",
      name: "JIRA",
      description: "Connect your JIRA workspace to search through issues and projects",
      icon: Calendar,
      color: "bg-blue-600",
      status: "connected"
    }
  ];

  const handleConnect = async (sourceId) => {
    setConnectingStates(prev => ({ ...prev, [sourceId]: true }));
    try {
      // Get OAuth URL
      const authResponse = await fetch(`/api/integrations/auth?source=${sourceId}&action=auth_url`);
      const authData = await authResponse.json();
      
      if (authData.success) {
        // Open OAuth popup
        const popup = window.open(
          authData.authUrl,
          'oauth-popup',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth callback
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setConnectingStates(prev => ({ ...prev, [sourceId]: false }));
          }
        }, 1000);

        // Listen for message from popup
        window.addEventListener('message', async (event) => {
          if (event.data.type === 'OAUTH_SUCCESS') {
            const { code, source } = event.data;
            
            // Exchange code for tokens
            const tokenResponse = await fetch('/api/integrations/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                source,
                code,
                state: event.data.state
              }),
            });
            
            const tokenData = await tokenResponse.json();
            
            if (tokenData.success) {
              // Store tokens (in real app, store in database)
              console.log('Storing tokens for', source, ':', tokenData.tokens);
              localStorage.setItem(`${source}_tokens`, JSON.stringify(tokenData.tokens));
              setConnectedSources(prev => [...prev, sourceId]);
              setUserIntegrations(prev => ({
                ...prev,
                [source]: tokenData.tokens
              }));
              
              // Close popup
              popup.close();
              clearInterval(checkClosed);
            }
          }
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectingStates(prev => ({ ...prev, [sourceId]: false }));
    }
  };

  const handleDisconnect = async (sourceId) => {
    try {
      // Clear stored tokens
      localStorage.removeItem(`${sourceId}_tokens`);
      
      // Update state
      setConnectedSources(prev => prev.filter(id => id !== sourceId));
      setUserIntegrations(prev => {
        const updated = { ...prev };
        delete updated[sourceId];
        return updated;
      });
      
      // Optional: Call API to revoke tokens
      // const response = await fetch('/api/integrations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sourceId, action: 'disconnect' }),
      // });
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Multi-Source Knowledge Integration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect all your knowledge sources in one place. Search across Notion, Google Drive, JIRA, and more with AI-powered semantic search.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {connectedSources.length}
                </div>
                <div className="text-gray-600">Connected Sources</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {sources.filter(s => s.status === "available").length}
                </div>
                <div className="text-gray-600">Available Integrations</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  24/7
                </div>
                <div className="text-gray-600">AI-Powered Search</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Sources Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Connect Your Knowledge Sources
            </h2>
            <p className="text-gray-600">
              Choose from our supported integrations to start building your unified knowledge base.
            </p>
          </motion.div>

          <ProgressIndicator 
            connectedCount={connectedSources.length}
            totalCount={sources.length}
            isProcessing={Object.values(connectingStates).some(state => state)}
            connectingSource={Object.keys(connectingStates).find(key => connectingStates[key]) || null}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source, index) => (
              <IntegrationCard
                key={source.id}
                source={source}
                isConnected={connectedSources.includes(source.id)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                isConnecting={connectingStates[source.id] || false}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Demo Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <SearchDemo connectedSources={connectedSources} userIntegrations={userIntegrations} />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Multi-Source Integration?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unify your knowledge across all platforms with intelligent search and AI-powered insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Unified Search",
                description: "Search across all your connected sources with a single query",
                icon: "🔍"
              },
              {
                title: "AI-Powered",
                description: "Advanced AI understands context and provides relevant results",
                icon: "🤖"
              },
              {
                title: "Real-time Sync",
                description: "Automatic synchronization keeps your knowledge base up-to-date",
                icon: "⚡"
              },
              {
                title: "Secure & Private",
                description: "Enterprise-grade security with end-to-end encryption",
                icon: "🔒"
              },
              {
                title: "Smart Filters",
                description: "Filter results by source, date, type, and more",
                icon: "🎯"
              },
              {
                title: "Collaborative",
                description: "Share insights and collaborate with your team",
                icon: "👥"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Unify Your Knowledge?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start connecting your sources and experience the power of unified AI search.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-5 h-5 mr-2" />
                Configure Integrations
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeIntegration; 