'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import Membres from '@/pages/Members'
import { Subscriptions } from '@/pages/Subscriptions'
import { MemberForm } from '@/components/forms/MemberForm'
import { useMembers } from '@/app/hooks/useMembers'
import { useModal } from '@/app/hooks/useModal'


type TabType = 'members' | 'subscriptions' | 'unpaid'

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<TabType>('members')
    const [searchQuery, setSearchQuery] = useState('')
    const { createMember } = useMembers()
    const memberModal = useModal()

    const renderContent = () => {
        switch (activeTab) {
            case 'members':
                return <Membres searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            case 'subscriptions':
                return <Subscriptions />
            case 'unpaid':
                return <div className="p-6">Membres impayés - En cours de développement</div>
            default:
                return <Membres searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        }
    }

    return (
        <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNewMember={memberModal.openModal}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            {renderContent()}

            <MemberForm
                isOpen={memberModal.isOpen}
                onClose={memberModal.closeModal}
                onSave={async (data) => {
                    await createMember(data);
                }}
            />
        </Header>
    )
} 