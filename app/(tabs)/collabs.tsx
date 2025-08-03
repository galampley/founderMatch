import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Users, Clock, CheckCircle, X, Check, Plus, Code, Target, Lightbulb, MessageSquare, Calendar, AlertCircle } from 'lucide-react-native';

interface Collab {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Business' | 'Product' | 'Design';
  icon: React.ReactNode;
  steps: Array<{
    title: string;
    description: string;
    successCriteria: string[];
  }>;
  outcome: string;
  successCriteria: string[];
}

interface ActiveCollab {
  id: number;
  title: string;
  partnerName: string;
  partnerPhoto: string;
  status: 'Proposed' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: string;
  dueDate: string;
  progress: number;
  category: 'Technical' | 'Business' | 'Product' | 'Design';
  completedSteps: number[];
  collabMethodId: number;
  stepNotes: { [stepIndex: number]: string };
  stepCriteriaCompletion: { [stepIndex: number]: boolean[] };
}

const collaborationMethods: Collab[] = [
  {
    id: 1,
    title: 'Code Review Challenge',
    description: 'Review each other\'s code samples and provide constructive feedback to assess technical compatibility.',
    duration: '2-3 hours',
    difficulty: 'Easy',
    category: 'Technical',
    icon: <Code size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Share Code Samples',
        description: 'Each person shares a recent code sample (GitHub repo or snippet)',
        successCriteria: [
          'Both parties share a substantial code sample (minimum 100 lines)',
          'Code includes comments and documentation',
          'Repository or snippet is accessible and well-organized'
        ]
      },
      {
        title: 'Review Code',
        description: 'Spend 30-45 minutes reviewing the other person\'s code',
        successCriteria: [
          'Complete thorough review within the time limit',
          'Examine code structure, logic, and best practices',
          'Take notes on strengths and areas for improvement'
        ]
      },
      {
        title: 'Provide Written Feedback',
        description: 'Provide written feedback on code quality, structure, and suggestions',
        successCriteria: [
          'Write detailed feedback covering at least 3 specific areas',
          'Include both positive observations and constructive criticism',
          'Provide actionable suggestions for improvement'
        ]
      },
      {
        title: 'Discussion Call',
        description: 'Discuss feedback in a 30-minute video call',
        successCriteria: [
          'Complete 30-minute video call discussing the feedback',
          'Both parties ask clarifying questions',
          'Maintain professional and constructive dialogue'
        ]
      },
      {
        title: 'Evaluate Compatibility',
        description: 'Evaluate communication style and technical alignment',
        successCriteria: [
          'Assess technical skill compatibility',
          'Evaluate communication effectiveness',
          'Determine mutual interest in further collaboration'
        ]
      }
    ],
    outcome: 'Assess technical skills, code quality standards, and communication style',
    successCriteria: [
      'Both parties provide detailed written feedback (minimum 3 specific points each)',
      'Complete 30-minute discussion call with constructive dialogue',
      'Identify at least 2 areas of technical alignment or complementary skills',
      'Rate each other\'s code quality and communication on agreed criteria',
      'Decide on mutual interest in further collaboration'
    ]
  },
  {
    id: 2,
    title: 'Mini Product Sprint',
    description: 'Build a simple feature or prototype together over a weekend to test collaboration dynamics.',
    duration: '2-3 days',
    difficulty: 'Medium',
    category: 'Product',
    icon: <Target size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Define Project Scope',
        description: 'Define a simple feature or mini-product to build together',
        successCriteria: [
          'Agree on a specific, achievable project scope',
          'Define clear success metrics for the deliverable',
          'Set realistic timeline and milestones'
        ]
      },
      {
        title: 'Setup Development Environment',
        description: 'Set up shared development environment (GitHub, Figma, etc.)',
        successCriteria: [
          'Create shared repository with proper access permissions',
          'Set up project structure and initial files',
          'Establish communication channels and tools'
        ]
      },
      {
        title: 'Divide Responsibilities',
        description: 'Divide responsibilities based on each person\'s strengths',
        successCriteria: [
          'Clearly define each person\'s responsibilities',
          'Align tasks with individual strengths and expertise',
          'Establish dependencies and handoff points'
        ]
      },
      {
        title: 'Execute Sprint',
        description: 'Work together over 2-3 days with regular check-ins',
        successCriteria: [
          'Complete daily check-ins to discuss progress',
          'Meet individual commitments and deadlines',
          'Collaborate effectively on shared components'
        ]
      },
      {
        title: 'Present and Reflect',
        description: 'Present the final result and reflect on the collaboration',
        successCriteria: [
          'Deliver working prototype or feature',
          'Present results to each other with demo',
          'Complete retrospective on collaboration process'
        ]
      }
    ],
    outcome: 'Test working dynamics, project management skills, and ability to deliver together',
    successCriteria: [
      'Deliver a working prototype or feature within the timeframe',
      'Maintain clear communication with daily check-ins',
      'Successfully divide tasks and meet individual commitments',
      'Resolve at least one disagreement or challenge collaboratively',
      'Complete joint retrospective identifying strengths and areas for improvement'
    ]
  },
  {
    id: 3,
    title: 'Business Case Study',
    description: 'Analyze a real business problem and present solutions together to evaluate strategic thinking.',
    duration: '4-5 hours',
    difficulty: 'Medium',
    category: 'Business',
    icon: <Lightbulb size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Select Case Study',
        description: 'Choose a relevant business case study or real company challenge',
        successCriteria: [
          'Select a case study relevant to your industry or interests',
          'Ensure sufficient complexity to demonstrate analytical skills',
          'Agree on the scope and focus areas for analysis'
        ]
      },
      {
        title: 'Independent Research',
        description: 'Research the problem independently (1-2 hours)',
        successCriteria: [
          'Complete 1-2 hours of focused research',
          'Gather data from multiple credible sources',
          'Document key findings and initial insights'
        ]
      },
      {
        title: 'Collaborative Discussion',
        description: 'Meet to discuss findings and brainstorm solutions',
        successCriteria: [
          'Share research findings openly and thoroughly',
          'Generate multiple solution alternatives together',
          'Build on each other\'s ideas constructively'
        ]
      },
      {
        title: 'Create Joint Presentation',
        description: 'Create a joint presentation or document with recommendations',
        successCriteria: [
          'Produce professional presentation with 3-5 recommendations',
          'Include supporting data and rationale for each recommendation',
          'Demonstrate clear problem-solution alignment'
        ]
      },
      {
        title: 'Present and Evaluate',
        description: 'Present to each other and discuss different approaches',
        successCriteria: [
          'Deliver clear, compelling presentation of findings',
          'Discuss alternative approaches and trade-offs',
          'Provide constructive feedback on analytical process'
        ]
      }
    ],
    outcome: 'Evaluate analytical thinking, business acumen, and collaborative problem-solving',
    successCriteria: [
      'Complete individual research with documented findings',
      'Produce joint presentation with 3-5 actionable recommendations',
      'Demonstrate understanding of business fundamentals and market dynamics',
      'Show ability to synthesize different perspectives into cohesive solutions',
      'Provide constructive feedback on each other\'s analytical approach'
    ]
  },
  {
    id: 4,
    title: 'Startup Pitch Workshop',
    description: 'Develop and refine each other\'s startup ideas through structured feedback sessions.',
    duration: '3-4 hours',
    difficulty: 'Easy',
    category: 'Business',
    icon: <MessageSquare size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Prepare Initial Pitches',
        description: 'Each person prepares a 5-minute pitch of their startup idea',
        successCriteria: [
          'Create structured 5-minute pitch covering problem, solution, market',
          'Include visual aids or slides if helpful',
          'Practice timing to stay within limit'
        ]
      },
      {
        title: 'Present to Each Other',
        description: 'Present pitches to each other',
        successCriteria: [
          'Deliver clear, engaging presentation within time limit',
          'Maintain good eye contact and confident delivery',
          'Allow time for clarifying questions'
        ]
      },
      {
        title: 'Provide Structured Feedback',
        description: 'Provide structured feedback using a framework (problem, solution, market, etc.)',
        successCriteria: [
          'Use consistent framework to evaluate each pitch',
          'Provide specific, actionable feedback on each component',
          'Balance constructive criticism with positive observations'
        ]
      },
      {
        title: 'Collaborative Improvement',
        description: 'Brainstorm improvements and iterations together',
        successCriteria: [
          'Generate specific improvement suggestions for each pitch',
          'Collaborate on refining value propositions',
          'Identify potential synergies between ideas'
        ]
      },
      {
        title: 'Re-pitch with Improvements',
        description: 'Re-pitch with incorporated feedback',
        successCriteria: [
          'Incorporate feedback into revised pitch',
          'Demonstrate improved clarity and compelling narrative',
          'Show receptiveness to feedback and ability to iterate'
        ]
      }
    ],
    outcome: 'Assess communication skills, receptiveness to feedback, and strategic thinking',
    successCriteria: [
      'Deliver clear, compelling 5-minute pitches for both ideas',
      'Provide structured feedback covering problem, solution, market, and execution',
      'Incorporate feedback into improved second pitch versions',
      'Demonstrate active listening and openness to criticism',
      'Identify potential synergies between the two startup concepts'
    ]
  },
  {
    id: 5,
    title: 'Technical Architecture Design',
    description: 'Collaborate on designing the technical architecture for a hypothetical or real project.',
    duration: '3-4 hours',
    difficulty: 'Hard',
    category: 'Technical',
    icon: <Code size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Define System Requirements',
        description: 'Define requirements for a technical system (e.g., social media app)',
        successCriteria: [
          'Document functional and non-functional requirements',
          'Define expected scale and performance metrics',
          'Identify key constraints and assumptions'
        ]
      },
      {
        title: 'Individual Architecture Sketches',
        description: 'Individually sketch initial architecture ideas',
        successCriteria: [
          'Create detailed architecture diagram with major components',
          'Consider scalability, security, and performance',
          'Document technology choices and rationale'
        ]
      },
      {
        title: 'Share and Discuss Approaches',
        description: 'Share and discuss different approaches',
        successCriteria: [
          'Present architecture clearly with visual diagrams',
          'Explain design decisions and trade-offs',
          'Ask thoughtful questions about alternative approaches'
        ]
      },
      {
        title: 'Collaborate on Unified Design',
        description: 'Collaborate on a unified architecture design',
        successCriteria: [
          'Synthesize best elements from both approaches',
          'Reach consensus on major architectural decisions',
          'Address scalability and reliability concerns'
        ]
      },
      {
        title: 'Document Final Architecture',
        description: 'Document decisions and trade-offs made together',
        successCriteria: [
          'Create comprehensive architecture documentation',
          'Document key decisions and rationale',
          'Include deployment and monitoring considerations'
        ]
      }
    ],
    outcome: 'Evaluate technical depth, system design skills, and decision-making process',
    successCriteria: [
      'Create detailed system architecture diagram with all major components',
      'Document key technical decisions and rationale behind choices',
      'Address scalability, security, and performance considerations',
      'Demonstrate knowledge of relevant technologies and best practices',
      'Reach consensus on final design through collaborative discussion'
    ]
  },
  {
    id: 6,
    title: 'Customer Interview Practice',
    description: 'Conduct mock customer interviews to validate a business idea and practice user research skills.',
    duration: '2-3 hours',
    difficulty: 'Easy',
    category: 'Product',
    icon: <Users size={24} color="#0077b5" />,
    steps: [
      {
        title: 'Select Validation Target',
        description: 'Choose a startup idea to validate',
        successCriteria: [
          'Select specific startup idea with clear value proposition',
          'Define target customer segment to focus on',
          'Identify key assumptions to test through interviews'
        ]
      },
      {
        title: 'Prepare Interview Guide',
        description: 'Prepare interview questions together',
        successCriteria: [
          'Create comprehensive interview guide with 10-15 questions',
          'Include mix of open-ended and follow-up questions',
          'Focus on customer problems rather than solutions'
        ]
      },
      {
        title: 'Role-Play Setup',
        description: 'Take turns being interviewer and customer',
        successCriteria: [
          'Define realistic customer personas for role-play',
          'Establish clear scenarios and contexts',
          'Agree on feedback format for interview performance'
        ]
      },
      {
        title: 'Conduct Mock Interviews',
        description: 'Conduct 2-3 mock interviews each',
        successCriteria: [
          'Complete 4-6 total mock interviews with different scenarios',
          'Demonstrate effective interviewing techniques',
          'Take detailed notes during each interview'
        ]
      },
      {
        title: 'Analyze and Synthesize',
        description: 'Analyze findings and discuss insights together',
        successCriteria: [
          'Extract 3-5 key insights about customer needs',
          'Identify patterns across multiple interviews',
          'Translate insights into actionable product recommendations'
        ]
      }
    ],
    outcome: 'Test user research skills, empathy, and ability to extract insights from data',
    successCriteria: [
      'Develop comprehensive interview guide with 10-15 thoughtful questions',
      'Complete 4-6 mock interviews with realistic customer personas',
      'Extract 3-5 key insights about user needs and pain points',
      'Demonstrate effective interviewing techniques (open-ended questions, active listening)',
      'Synthesize findings into actionable recommendations for product development'
    ]
  }
];

const sampleActiveCollabs: ActiveCollab[] = [
  {
    id: 1,
    title: 'Code Review Challenge',
    partnerName: 'Sarah Chen',
    partnerPhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'In Progress',
    startDate: '2024-01-15',
    dueDate: '2024-01-17',
    progress: 60,
    category: 'Technical',
    completedSteps: [0, 1, 2],
    collabMethodId: 1,
    stepNotes: {
      0: "Shared React component library on GitHub",
      1: "Reviewed Sarah's authentication system - very clean code",
      2: "Provided detailed feedback on error handling patterns"
    },
    stepCriteriaCompletion: {
      0: [true, true, true],
      1: [true, true, true],
      2: [true, true, true]
    },
  },
  {
    id: 2,
    title: 'Business Case Study',
    partnerName: 'Alex Rodriguez',
    partnerPhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'Proposed',
    startDate: '2024-01-20',
    dueDate: '2024-01-22',
    progress: 0,
    category: 'Business',
    completedSteps: [],
    collabMethodId: 3,
    stepNotes: {},
    stepCriteriaCompletion: {},
  },
  {
    id: 3,
    title: 'Mini Product Sprint',
    partnerName: 'Maya Patel',
    partnerPhoto: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'Completed',
    startDate: '2024-01-10',
    dueDate: '2024-01-13',
    progress: 100,
    category: 'Product',
    completedSteps: [0, 1, 2, 3, 4],
    collabMethodId: 2,
    stepNotes: {
      0: "Built a task management feature for small teams",
      1: "Set up shared GitHub repo with proper CI/CD",
      2: "Maya handled frontend, I handled backend API",
      3: "Daily standups worked great for coordination",
      4: "Successfully delivered working prototype on time"
    },
    stepCriteriaCompletion: {
      0: [true, true, true],
      1: [true, true, true],
      2: [true, true, true],
      3: [true, true, true],
      4: [true, true, true]
    },
  },
];

export default function CollabsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'options'>('active');
  const [selectedCollab, setSelectedCollab] = useState<Collab | null>(null);
  const [selectedActiveCollab, setSelectedActiveCollab] = useState<ActiveCollab | null>(null);
  const [selectedStep, setSelectedStep] = useState<{collab: Collab, stepIndex: number} | null>(null);
  const [activeCollabs, setActiveCollabs] = useState(sampleActiveCollabs);
  const [showCreateCustomModal, setShowCreateCustomModal] = useState(false);

  // Initialize step editing state when a step is selected
  const initializeStepState = (activeCollab: ActiveCollab, stepIndex: number) => {
    const existingNotes = activeCollab.stepNotes[stepIndex] || '';
    const existingCompletion = activeCollab.stepCriteriaCompletion[stepIndex] || [];
    const collabMethod = collaborationMethods.find(c => c.id === activeCollab.collabMethodId);
    const criteriaCount = collabMethod?.steps[stepIndex]?.successCriteria.length || 0;
    
    // Initialize completion array if it doesn't exist or is wrong length
    const completion = existingCompletion.length === criteriaCount 
      ? existingCompletion 
      : new Array(criteriaCount).fill(false);
    
    return { notes: existingNotes, completion };
  };

  const [currentStepNotes, setCurrentStepNotes] = useState('');
  const [currentCriteriaCompletion, setCurrentCriteriaCompletion] = useState<boolean[]>([]);
  
  // Custom collaboration form state
  const [customCollabForm, setCustomCollabForm] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'Business' as 'Technical' | 'Business' | 'Product' | 'Design',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    steps: [{ title: '', description: '', successCriteria: [''] }],
    outcome: '',
    successCriteria: ['']
  });

  // Update state when step selection changes
  useEffect(() => {
    if (selectedStep && selectedActiveCollab) {
      const { notes, completion } = initializeStepState(selectedActiveCollab, selectedStep.stepIndex);
      setCurrentStepNotes(notes);
      setCurrentCriteriaCompletion(completion);
    }
  }, [selectedStep, selectedActiveCollab]);

  const toggleCriteria = (criteriaIndex: number) => {
    setCurrentCriteriaCompletion(prev => 
      prev.map((completed, index) => 
        index === criteriaIndex ? !completed : completed
      )
    );
  };

  const saveStepProgress = () => {
    if (!selectedStep || !selectedActiveCollab) return;

    const allCriteriaCompleted = currentCriteriaCompletion.every(completed => completed);
    
    setActiveCollabs(prev => prev.map(collab => {
      if (collab.id === selectedActiveCollab.id) {
        const updatedStepNotes = {
          ...collab.stepNotes,
          [selectedStep.stepIndex]: currentStepNotes
        };
        
        const updatedCriteriaCompletion = {
          ...collab.stepCriteriaCompletion,
          [selectedStep.stepIndex]: currentCriteriaCompletion
        };
        
        let updatedCompletedSteps = [...collab.completedSteps];
        
        if (allCriteriaCompleted && !updatedCompletedSteps.includes(selectedStep.stepIndex)) {
          updatedCompletedSteps.push(selectedStep.stepIndex);
        } else if (!allCriteriaCompleted && updatedCompletedSteps.includes(selectedStep.stepIndex)) {
          updatedCompletedSteps = updatedCompletedSteps.filter(step => step !== selectedStep.stepIndex);
        }
        
        const collabMethod = collaborationMethods.find(c => c.id === collab.collabMethodId);
        const totalSteps = collabMethod?.steps.length || 1;
        const progress = Math.round((updatedCompletedSteps.length / totalSteps) * 100);
        
        return {
          ...collab,
          stepNotes: updatedStepNotes,
          stepCriteriaCompletion: updatedCriteriaCompletion,
          completedSteps: updatedCompletedSteps,
          progress
        };
      }
      return collab;
    }));
    
    // Update the selected active collab to reflect changes
    setSelectedActiveCollab(prev => {
      if (!prev) return prev;
      const updated = activeCollabs.find(c => c.id === prev.id);
      return updated || prev;
    });
    
    setSelectedStep(null);
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return '#3b82f6';
      case 'Business': return '#8b5cf6';
      case 'Product': return '#10b981';
      case 'Design': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Proposed': return '#f59e0b';
      case 'In Progress': return '#3b82f6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Proposed': return <AlertCircle size={16} color="#f59e0b" />;
      case 'In Progress': return <Clock size={16} color="#3b82f6" />;
      case 'Completed': return <CheckCircle size={16} color="#10b981" />;
      case 'Cancelled': return <X size={16} color="#ef4444" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const renderActiveCollabCard = (collab: ActiveCollab) => (
    <TouchableOpacity 
      key={collab.id} 
      style={styles.activeCollabCard}
      onPress={() => setSelectedActiveCollab(collab)}
    >
      <View style={styles.activeCollabHeader}>
        <View style={styles.partnerInfo}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerInitial}>{collab.partnerName[0]}</Text>
          </View>
          <View style={styles.partnerDetails}>
            <Text style={styles.partnerName}>{collab.partnerName}</Text>
            <Text style={styles.collabTitle}>{collab.title}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(collab.status)}
          <Text style={[styles.statusText, { color: getStatusColor(collab.status) }]}>
            {collab.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${collab.progress}%`,
                backgroundColor: getStatusColor(collab.status)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{collab.progress}%</Text>
      </View>
      
      <View style={styles.activeCollabMeta}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#999" />
          <Text style={styles.metaText}>Due {collab.dueDate}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(collab.category) }]}>
          <Text style={styles.categoryText}>{collab.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCollabCard = (collab: Collab) => (
    <TouchableOpacity
      key={collab.id}
      style={styles.collabCard}
      onPress={() => setSelectedCollab(collab)}
    >
      <View style={styles.collabHeader}>
        <View style={styles.collabIcon}>
          {collab.icon}
        </View>
        <View style={styles.collabInfo}>
          <Text style={styles.collabTitle}>{collab.title}</Text>
          <Text style={styles.collabDescription}>{collab.description}</Text>
        </View>
      </View>
      
      <View style={styles.collabMeta}>
        <View style={styles.metaItem}>
          <Clock size={14} color="#999" />
          <Text style={styles.metaText}>{collab.duration}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(collab.difficulty) }]}>
          <Text style={styles.difficultyText}>{collab.difficulty}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(collab.category) }]}>
          <Text style={styles.categoryText}>{collab.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Collaborations</Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'active' ? 'Track your ongoing collaborations' : 'Discover collaboration methods'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateCustomModal(true)}
          >
            <Plus size={24} color="#0077b5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active Collabs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'options' && styles.activeTab]}
          onPress={() => setActiveTab('options')}
        >
          <Text style={[styles.tabText, activeTab === 'options' && styles.activeTabText]}>
            Collab Options
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          <View style={styles.activeCollabsList}>
            {activeCollabs.length > 0 ? (
              activeCollabs.map(renderActiveCollabCard)
            ) : (
              <View style={styles.emptyState}>
                <Users size={48} color="#666" />
                <Text style={styles.emptyTitle}>No Active Collaborations</Text>
                <Text style={styles.emptySubtitle}>
                  Switch to Collab Options to propose new collaborations with your matches
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.collabsList}>
              {collaborationMethods.map(renderCollabCard)}
            </View>
            
            <View style={styles.addCustomContainer}>
              <TouchableOpacity 
                style={styles.addCustomButton}
                onPress={() => setShowCreateCustomModal(true)}
              >
                <Plus size={20} color="#0077b5" />
                <Text style={styles.addCustomText}>Create Custom Collaboration</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Collab Detail Modal */}
      <Modal
        visible={selectedCollab !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCollab(null)}
      >
        {selectedCollab && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedCollab(null)}>
                <X size={24} color="#999" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedCollab.title}</Text>
              <TouchableOpacity style={styles.proposeButton}>
                <Text style={styles.proposeButtonText}>Propose</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader2}>
                <View style={styles.modalIcon}>
                  {selectedCollab.icon}
                </View>
                <View style={styles.modalMeta}>
                  <View style={styles.metaRow}>
                    <Clock size={16} color="#999" />
                    <Text style={styles.modalMetaText}>{selectedCollab.duration}</Text>
                  </View>
                  <View style={styles.modalBadges}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedCollab.difficulty) }]}>
                      <Text style={styles.difficultyText}>{selectedCollab.difficulty}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedCollab.category) }]}>
                      <Text style={styles.categoryText}>{selectedCollab.category}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.modalDescription}>{selectedCollab.description}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How it works</Text>
                {selectedCollab.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepText}>{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expected Outcome</Text>
                <Text style={styles.outcomeText}>{selectedCollab.outcome}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Success Criteria</Text>
                <Text style={styles.sectionSubtitle}>Complete these to mark the collaboration as successful:</Text>
                {selectedCollab.successCriteria.map((criteria, index) => (
                  <View key={index} style={styles.criteriaItem}>
                    <View style={styles.criteriaCheckbox}>
                      <Text style={styles.criteriaCheckboxText}>✓</Text>
                    </View>
                    <Text style={styles.criteriaText}>{criteria}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Active Collab Detail Modal */}
      <Modal
        visible={selectedActiveCollab !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedActiveCollab(null)}
      >
        {selectedActiveCollab && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedActiveCollab(null)}>
                <X size={24} color="#999" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedActiveCollab.title}</Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(selectedActiveCollab.status)}
                <Text style={[styles.statusText, { color: getStatusColor(selectedActiveCollab.status) }]}>
                  {selectedActiveCollab.status}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Partner Info */}
              <View style={styles.partnerSection}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitial}>{selectedActiveCollab.partnerName[0]}</Text>
                </View>
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerName}>{selectedActiveCollab.partnerName}</Text>
                  <Text style={styles.collabTitle}>Collaborating on {selectedActiveCollab.title}</Text>
                </View>
              </View>

              {/* Progress Overview */}
              <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Progress Overview</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${selectedActiveCollab.progress}%`,
                          backgroundColor: getStatusColor(selectedActiveCollab.status)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{selectedActiveCollab.progress}%</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateText}>Started: {selectedActiveCollab.startDate}</Text>
                  <Text style={styles.dateText}>Due: {selectedActiveCollab.dueDate}</Text>
                </View>
              </View>

              {/* Steps Progress */}
              <View style={styles.stepsSection}>
                <Text style={styles.sectionTitle}>How it works</Text>
                {(() => {
                  const collabMethod = collaborationMethods.find(c => c.id === selectedActiveCollab.collabMethodId);
                  return collabMethod?.steps.map((step, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.clickableStepItem,
                        selectedActiveCollab.completedSteps.includes(index) 
                          ? styles.completedClickableStep 
                          : styles.pendingClickableStep
                      ]}
                      onPress={() => {
                        setSelectedStep({collab: collabMethod, stepIndex: index});
                      }}
                    >
                      <View style={[
                        styles.stepNumber,
                        selectedActiveCollab.completedSteps.includes(index) 
                          ? styles.completedStepNumber 
                          : styles.pendingStepNumber
                      ]}>
                        {selectedActiveCollab.completedSteps.includes(index) ? (
                          <Text style={styles.checkmark}>✓</Text>
                        ) : (
                          <Text style={styles.stepNumberText}>{index + 1}</Text>
                        )}
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[
                          styles.stepTitle,
                          selectedActiveCollab.completedSteps.includes(index) 
                            ? styles.completedStepText 
                            : styles.pendingStepText
                        ]}>
                          {step.title}
                        </Text>
                        <Text style={[
                          styles.stepText,
                          selectedActiveCollab.completedSteps.includes(index) 
                            ? styles.completedStepText 
                            : styles.pendingStepText
                        ]}>
                          {step.description}
                        </Text>
                      </View>
                      <Text style={styles.chevronIcon}>›</Text>
                    </TouchableOpacity>
                  ));
                })()}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Create Custom Collaboration Modal */}
      <Modal
        visible={showCreateCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateCustomModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateCustomModal(false)}>
              <X size={24} color="#999" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Custom Collaboration</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                // TODO: Handle form submission
                Alert.alert('Success', 'Custom collaboration created!');
                setShowCreateCustomModal(false);
                setCustomCollabForm({
                  title: '',
                  description: '',
                  duration: '',
                  category: 'Business',
                  difficulty: 'Medium',
                  steps: [{ title: '', description: '', successCriteria: [''] }],
                  outcome: '',
                  successCriteria: ['']
                });
              }}
            >
              <Text style={styles.saveButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collaboration Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.formInput}
                  value={customCollabForm.title}
                  onChangeText={(text) => setCustomCollabForm(prev => ({...prev, title: text}))}
                  placeholder="Enter collaboration title..."
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={customCollabForm.description}
                  onChangeText={(text) => setCustomCollabForm(prev => ({...prev, description: text}))}
                  placeholder="Describe what you want to collaborate on..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expected Duration</Text>
                <TextInput
                  style={styles.formInput}
                  value={customCollabForm.duration}
                  onChangeText={(text) => setCustomCollabForm(prev => ({...prev, duration: text}))}
                  placeholder="e.g., 2-3 hours, 1-2 days..."
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categorySelector}>
                  {(['Technical', 'Business', 'Product', 'Design'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        customCollabForm.category === cat && styles.categoryOptionSelected
                      ]}
                      onPress={() => setCustomCollabForm(prev => ({...prev, category: cat}))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        customCollabForm.category === cat && styles.categoryOptionTextSelected
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Difficulty</Text>
                <View style={styles.categorySelector}>
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.categoryOption,
                        customCollabForm.difficulty === diff && styles.categoryOptionSelected
                      ]}
                      onPress={() => setCustomCollabForm(prev => ({...prev, difficulty: diff}))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        customCollabForm.difficulty === diff && styles.categoryOptionTextSelected
                      ]}>
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expected Outcome</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={customCollabForm.outcome}
                  onChangeText={(text) => setCustomCollabForm(prev => ({...prev, outcome: text}))}
                  placeholder="What should participants achieve from this collaboration?"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>How it works</Text>
                <Text style={styles.formSubtitle}>Define the steps participants should follow:</Text>
                {customCollabForm.steps.map((step, stepIndex) => (
                  <View key={stepIndex} style={styles.stepFormContainer}>
                    <View style={styles.stepFormHeader}>
                      <Text style={styles.stepFormTitle}>Step {stepIndex + 1}</Text>
                      {customCollabForm.steps.length > 1 && (
                        <TouchableOpacity
                          onPress={() => {
                            const newSteps = customCollabForm.steps.filter((_, i) => i !== stepIndex);
                            setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                          }}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <TextInput
                      style={styles.formInput}
                      value={step.title}
                      onChangeText={(text) => {
                        const newSteps = [...customCollabForm.steps];
                        newSteps[stepIndex] = {...step, title: text};
                        setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                      }}
                      placeholder="Step title..."
                      placeholderTextColor="#666"
                    />
                    
                    <TextInput
                      style={[styles.formInput, styles.textArea, {marginTop: 8}]}
                      value={step.description}
                      onChangeText={(text) => {
                        const newSteps = [...customCollabForm.steps];
                        newSteps[stepIndex] = {...step, description: text};
                        setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                      }}
                      placeholder="Step description..."
                      placeholderTextColor="#666"
                      multiline
                      numberOfLines={2}
                    />

                    <Text style={styles.formSubtitle}>Success criteria for this step:</Text>
                    {step.successCriteria.map((criteria, criteriaIndex) => (
                      <View key={criteriaIndex} style={styles.criteriaInputContainer}>
                        <TextInput
                          style={[styles.formInput, {flex: 1}]}
                          value={criteria}
                          onChangeText={(text) => {
                            const newSteps = [...customCollabForm.steps];
                            const newCriteria = [...step.successCriteria];
                            newCriteria[criteriaIndex] = text;
                            newSteps[stepIndex] = {...step, successCriteria: newCriteria};
                            setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                          }}
                          placeholder="Success criteria..."
                          placeholderTextColor="#666"
                        />
                        {step.successCriteria.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => {
                              const newSteps = [...customCollabForm.steps];
                              const newCriteria = step.successCriteria.filter((_, i) => i !== criteriaIndex);
                              newSteps[stepIndex] = {...step, successCriteria: newCriteria};
                              setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                            }}
                          >
                            <X size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        const newSteps = [...customCollabForm.steps];
                        newSteps[stepIndex] = {...step, successCriteria: [...step.successCriteria, '']};
                        setCustomCollabForm(prev => ({...prev, steps: newSteps}));
                      }}
                    >
                      <Plus size={16} color="#0077b5" />
                      <Text style={styles.addButtonText}>Add criteria</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addStepButton}
                  onPress={() => {
                    setCustomCollabForm(prev => ({
                      ...prev, 
                      steps: [...prev.steps, { title: '', description: '', successCriteria: [''] }]
                    }));
                  }}
                >
                  <Plus size={20} color="#0077b5" />
                  <Text style={styles.addStepButtonText}>Add Step</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Overall Success Criteria</Text>
                <Text style={styles.formSubtitle}>What defines overall success for this collaboration?</Text>
                {customCollabForm.successCriteria.map((criteria, index) => (
                  <View key={index} style={styles.criteriaInputContainer}>
                    <TextInput
                      style={[styles.formInput, {flex: 1}]}
                      value={criteria}
                      onChangeText={(text) => {
                        const newCriteria = [...customCollabForm.successCriteria];
                        newCriteria[index] = text;
                        setCustomCollabForm(prev => ({...prev, successCriteria: newCriteria}));
                      }}
                      placeholder="Overall success criteria..."
                      placeholderTextColor="#666"
                    />
                    {customCollabForm.successCriteria.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          const newCriteria = customCollabForm.successCriteria.filter((_, i) => i !== index);
                          setCustomCollabForm(prev => ({...prev, successCriteria: newCriteria}));
                        }}
                      >
                        <X size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setCustomCollabForm(prev => ({
                      ...prev, 
                      successCriteria: [...prev.successCriteria, '']
                    }));
                  }}
                >
                  <Plus size={16} color="#0077b5" />
                  <Text style={styles.addButtonText}>Add criteria</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Step Detail Modal */}
      <Modal
        visible={selectedStep !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStep(null)}
      >
        {selectedStep && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedStep(null)}>
                <X size={24} color="#999" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Step {selectedStep.stepIndex + 1}: {selectedStep.collab.steps[selectedStep.stepIndex].title}
              </Text>
              <TouchableOpacity style={styles.saveButton} onPress={saveStepProgress}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.stepDetailHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{selectedStep.stepIndex + 1}</Text>
                </View>
                <View style={styles.stepDetailInfo}>
                  <Text style={styles.stepDetailTitle}>{selectedStep.collab.steps[selectedStep.stepIndex].title}</Text>
                  <Text style={styles.stepDetailDescription}>{selectedStep.collab.steps[selectedStep.stepIndex].description}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Success Criteria</Text>
                <Text style={styles.sectionSubtitle}>Complete these items to mark this step as successful:</Text>
                {selectedStep.collab.steps[selectedStep.stepIndex].successCriteria.map((criteria, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.criteriaItem}
                    onPress={() => toggleCriteria(index)}
                  >
                    <View style={[
                      styles.criteriaCheckbox,
                      currentCriteriaCompletion[index] 
                        ? styles.criteriaCheckboxChecked 
                        : styles.criteriaCheckboxUnchecked
                    ]}>
                      {currentCriteriaCompletion[index] && (
                        <Text style={styles.criteriaCheckboxText}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.criteriaText}>{criteria}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.sectionSubtitle}>Add any notes about your progress on this step:</Text>
                <TextInput
                  style={styles.notesInput}
                  value={currentStepNotes}
                  onChangeText={setCurrentStepNotes}
                  placeholder="Add your notes here..."
                  placeholderTextColor="#666"
                  multiline
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {currentStepNotes.length}/500 characters
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 119, 181, 0.1)',
    borderWidth: 1,
    borderColor: '#0077b5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0077b5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  activeCollabsList: {
    padding: 20,
  },
  activeCollabCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeCollabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0077b5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    minWidth: 35,
  },
  activeCollabMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  collabsList: {
    padding: 20,
  },
  collabCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  collabHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  collabIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collabInfo: {
    flex: 1,
  },
  collabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  collabDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  collabMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  addCustomContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addCustomButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0077b5',
    borderStyle: 'dashed',
    gap: 8,
  },
  addCustomText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  proposeButton: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  proposeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader2: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  modalMetaText: {
    fontSize: 14,
    color: '#999',
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#0077b5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 16,
    color: '#0077b5',
    lineHeight: 22,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  criteriaItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  criteriaCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  criteriaCheckboxChecked: {
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  criteriaCheckboxUnchecked: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#666',
  },
  criteriaCheckboxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  partnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  progressSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  stepsSection: {
    marginBottom: 32,
  },
  completedStepNumber: {
    backgroundColor: '#10b981',
  },
  pendingStepNumber: {
    backgroundColor: '#333',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  completedStepText: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  pendingStepText: {
    color: '#ccc',
  },
  clickableStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  completedClickableStep: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  pendingClickableStep: {
    borderColor: '#444',
  },
  chevronIcon: {
    fontSize: 20,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  stepDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  stepDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  stepDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  stepDetailDescription: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  categoryOptionSelected: {
    backgroundColor: '#0077b5',
    borderColor: '#0077b5',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  stepFormContainer: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  stepFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  criteriaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0077b5',
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0077b5',
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 16,
  },
  addStepButtonText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
});