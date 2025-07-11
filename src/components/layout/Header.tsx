'use client'

import { Users, CreditCard, AlertTriangle, BarChart3, Plus, Search, Settings } from 'lucide-react'

interface HeaderProps {
    activeTab: string
    onTabChange: (tab: any) => void
    onNewMember: () => void
    children: React.ReactNode
    searchQuery?: string
    onSearchChange?: (query: string) => void
}

export const Header: React.FC<HeaderProps & { onSecuritySettingsClick?: () => void }> = ({
    activeTab,
    onTabChange = () => { },
    onNewMember = () => { },
    children,
    searchQuery = '',
    onSearchChange,
    onSecuritySettingsClick
}) => {
    const tabs = [
        { id: 'members', label: 'Tous les membres', icon: Users },
        { id: 'subscriptions', label: 'Avec abonnement', icon: CreditCard },
        { id: 'unpaid', label: 'Impayés', icon: AlertTriangle }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Gym
                            </h1>

                            {/* Navigation Tabs */}
                            <nav className="flex space-x-6">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => onTabChange(tab.id)}
                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Search Bar and Security Settings */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    placeholder="Rechercher un membre..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
                                />
                            </div>
                            <button
                                type="button"
                                className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                title="Paramètres sécurité"
                                onClick={() => { if (onSecuritySettingsClick) onSecuritySettingsClick(); }}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Paramètres sécurité
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
} 