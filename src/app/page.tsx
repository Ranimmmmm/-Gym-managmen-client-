'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import Membres from '@/pages/Members'
import Subscriptions from '@/pages/Subscriptions'
import { MemberForm } from '@/components/forms/MemberForm'
import { useMembers } from '@/app/hooks/useMembers'
import { useModal } from '@/app/hooks/useModal'


type TabType = 'members' | 'subscriptions' | 'unpaid'

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<TabType>('members')
    const [searchQuery, setSearchQuery] = useState('')
    const { createMember, error } = useMembers()
    const memberModal = useModal()

    useEffect(() => {
        if (error) {
            console.error('Members error:', error);
        }
    }, [error]);

    const renderContent = () => {
        switch (activeTab) {
            case 'members':
                return <Membres />
            case 'subscriptions':
                return <Subscriptions />
            case 'unpaid':
                return <div className="p-6">Membres impayés - En cours de développement</div>
            default:
                return <Membres />
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