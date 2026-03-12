"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, FolderOpen } from "lucide-react";

const initialProjects = [
    { id: 1, name: "Project Alpha (Q1)", owner: "Sarah Jenkins", date: "Jan 12, 2026", roles: ["Admin", "Developer"], status: "Active" },
    { id: 2, name: "Global Marketing Platform", owner: "Michael Chen", date: "Feb 04, 2026", roles: ["Admin", "Program Manager"], status: "In Progress" },
    { id: 3, name: "HR Portal Rewrite", owner: "Emily Davis", date: "Feb 18, 2026", roles: ["Admin", "Business User", "Developer"], status: "Planning" },
    { id: 4, name: "Legacy System Migration", owner: "Robert Wilson", date: "Mar 01, 2026", roles: ["Admin", "Developer"], status: "Paused" },
    { id: 5, name: "Billing API Integration", owner: "John Doe", date: "Mar 03, 2026", roles: ["Admin", "Business User"], status: "Active" }
];

export default function AdminProjects() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProjects = initialProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900 flex items-center gap-3">
                        <FolderOpen className="text-[#00338D]" size={28} /> Project Governance
                    </h1>
                    <p className="text-slate-500">Manage enterprise projects and visibility controls.</p>
                </div>

                <button className="interactive flex items-center gap-2 px-4 py-2.5 bg-[#00338D] border border-transparent rounded-lg hover:bg-[#00266e] text-white transition-colors text-sm shadow-md font-medium">
                    <Plus size={16} /> Create Project
                </button>
            </motion.div>

            <AnimatedCard className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white text-sm"
                            placeholder="Search projects or owners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="interactive flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors text-sm shadow-sm font-medium whitespace-nowrap">
                        <Filter size={16} /> Filter By Status
                    </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Roles</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-900">{project.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {project.owner}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {project.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {project.roles.map((r, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                            ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ''}
                                            ${project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                                            ${project.status === 'Planning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                                            ${project.status === 'Paused' ? 'bg-slate-100 text-slate-700 border border-slate-200' : ''}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                                                ${project.status === 'Active' ? 'bg-emerald-500' : ''}
                                                ${project.status === 'In Progress' ? 'bg-blue-500' : ''}
                                                ${project.status === 'Planning' ? 'bg-amber-500' : ''}
                                                ${project.status === 'Paused' ? 'bg-slate-400' : ''}
                                            `}></span>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-slate-400 hover:text-[#00338D] hover:bg-slate-100 rounded-md transition-colors" title="Edit Project">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Project">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No projects found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Mock */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm">
                    <div className="text-slate-500">Showing 1 to {filteredProjects.length} of {initialProjects.length} projects</div>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-400 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1 border border-slate-200 rounded-md bg-slate-50 text-[#00338D] font-medium">1</button>
                        <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">2</button>
                        <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">Next</button>
                    </div>
                </div>

            </AnimatedCard>
        </div>
    );
}
