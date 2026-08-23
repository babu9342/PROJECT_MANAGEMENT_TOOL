import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Users,
  BarChart3,
  Bell,
  ArrowRight,
  Star,
  Kanban,
  MessageSquare,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Kanban,
    title: 'Kanban Boards',
    desc: 'Visualize your workflow with drag-and-drop Kanban boards. Move tasks between Backlog, To Do, In Progress, Review, and Done.',
    color: 'from-primary-600 to-primary-400',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Invite team members, assign roles, and collaborate in real-time. Everyone stays aligned.',
    color: 'from-accent-600 to-accent-400',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    desc: 'Instant notifications for task assignments, comments, and status changes via WebSockets.',
    color: 'from-emerald-600 to-emerald-400',
  },
  {
    icon: MessageSquare,
    title: 'Task Discussions',
    desc: 'Comment threads on every task keep conversations focused and in context.',
    color: 'from-amber-600 to-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Get a bird\'s-eye view of your projects, completed tasks, and team productivity.',
    color: 'from-rose-600 to-rose-400',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT authentication, bcrypt hashing, and role-based access control keep your data safe.',
    color: 'from-violet-600 to-violet-400',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    text: 'FlowBoard transformed how our team manages projects. The Kanban board is intuitive and the real-time updates are game-changing.',
    avatar: 'SJ',
  },
  {
    name: 'Marcus Chen',
    role: 'Engineering Lead',
    text: 'Finally a project tool that feels modern. The dark UI is beautiful and the drag-drop is buttery smooth.',
    avatar: 'MC',
  },
  {
    name: 'Priya Sharma',
    role: 'Design Director',
    text: 'Our entire design team switched to FlowBoard. The collaboration features are top-notch.',
    avatar: 'PS',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-950/80 backdrop-blur-md border-b border-dark-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">FlowBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-accent-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
            <Star size={14} className="fill-primary-400" />
            The modern project management tool
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Manage Projects
            <br />
            <span className="text-gradient">Like a Pro</span>
          </h1>

          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FlowBoard is a real-time collaborative project management platform. 
            Organize tasks on Kanban boards, communicate with your team, and ship faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 glow-primary"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Sign in
            </Link>
          </div>

          <p className="text-sm text-dark-500 mt-6">No credit card required • Free forever for personal use</p>
        </div>

        {/* Hero app preview */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="card overflow-hidden shadow-2xl shadow-primary-900/20 border-dark-700">
            {/* Mock app UI */}
            <div className="bg-dark-900 p-4 border-b border-dark-700 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 bg-dark-800 rounded-lg h-6 mx-4" />
            </div>
            <div className="bg-dark-900 p-6 grid grid-cols-4 gap-4 min-h-[280px]">
              {['Backlog', 'To Do', 'In Progress', 'Done'].map((col, ci) => (
                <div key={col} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        ['bg-dark-500', 'bg-blue-500', 'bg-primary-500', 'bg-emerald-500'][ci]
                      }`}
                    />
                    <span className="text-xs font-semibold text-dark-400">{col}</span>
                    <span className="text-xs text-dark-600 ml-auto">{ci + 1}</span>
                  </div>
                  {[...Array(ci === 2 ? 3 : ci + 1)].map((_, i) => (
                    <div key={i} className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                      <div
                        className={`h-2.5 rounded mb-2 ${
                          ['bg-dark-600', 'bg-blue-500/30', 'bg-primary-500/30', 'bg-emerald-500/30'][ci]
                        }`}
                        style={{ width: `${60 + Math.random() * 30}%` }}
                      />
                      <div className="flex items-center justify-between">
                        <div className={`h-4 rounded-full px-2 text-[9px] flex items-center ${
                          ['bg-dark-700 text-dark-400', 'badge-medium', 'badge-high', 'badge-done'][ci]
                        }`}>
                          {['Low', 'Med', 'High', 'Done'][ci]}
                        </div>
                        <div className="w-5 h-5 rounded-full bg-primary-600 text-[7px] text-white flex items-center justify-center font-bold">
                          {['SJ', 'MC', 'PS', 'AK'][i % 4]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-600/20 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              All the tools to manage projects from start to finish, in one beautiful workspace.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-dark-100 mb-2 group-hover:text-white transition-colors">
                  {title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-dark-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by teams everywhere</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }) => (
              <div key={name} className="card p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-100">{name}</p>
                    <p className="text-xs text-dark-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-600/10 pointer-events-none" />
            <h2 className="text-4xl font-bold mb-4 relative">
              Ready to build something great?
            </h2>
            <p className="text-dark-400 mb-8 text-lg relative">
              Join teams that use FlowBoard to ship projects faster.
            </p>
            <Link
              to="/register"
              className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2 relative"
            >
              Get started for free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-accent-500 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold gradient-text">FlowBoard</span>
          </div>
          <p className="text-dark-500 text-sm">© 2024 FlowBoard. Built with precision & style.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
