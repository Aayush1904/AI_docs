import { Search, BrainCircuit } from "lucide-react";

const Logo = () => {
  return (
    <div className="group relative flex items-center gap-2 md:gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-slate-900 to-black p-2 md:p-3 pr-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(67,56,202,0.3)] dark:border-white/20">
      {/* Neural network background effect */}
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(67,56,202,0.15)_0%,transparent_70%)] transition-all group-hover:opacity-100" />
      
      {/* Pulsing AI core icon */}
      <div className="relative z-10">
        <BrainCircuit className="h-6 w-6 md:h-8 md:w-8 text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse-slow" />
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
      </div>

      {/* Animated text and search integration */}
      <div className="relative z-10 flex flex-col md:flex-row items-baseline gap-1 md:gap-2">
        <h1 className="bg-gradient-to-r from-indigo-300 to-cyan-400 bg-clip-text text-lg md:text-2xl font-bold tracking-tight text-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(165,180,252,0.4)]">
          NeuralDocs
        </h1>
        <span className="text-xs md:text-sm font-medium text-gray-400 transition-colors group-hover:text-cyan-200">
          v2.1
        </span>
      </div>

      {/* Interactive search element */}
      <div className="relative ml-1 transition-transform duration-300 group-hover:translate-x-1">
        <Search className="h-5 w-5 md:h-6 md:w-6 text-cyan-300/80 transition-all duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
        <div className="absolute -inset-2 -left-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Hover scan line effect */}
      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_right,transparent_45%,rgba(165,180,252,0.05)_50%,transparent_55%)] bg-[length:300%_100%] opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:bg-[position:-100%_0]" />
    </div>
  );
};

export default Logo;