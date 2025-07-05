const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        } else {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text.substring(0, 200)}`);
        }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        const text = await response.text();
        throw new Error(`Expected JSON response but got: ${text.substring(0, 200)}`);
    }
};

export const api = {
    // Membres
    getAllMembers: () => fetch(`${API_BASE_URL}/members/all`).then(handleResponse),

    getMembersWithSubscription: () => fetch(`${API_BASE_URL}/members/with-subscriptions`).then(handleResponse),

    getUnpaidMembers: () => fetch(`${API_BASE_URL}/members/unpaid-members`).then(handleResponse),

    createMember: (data: any) => fetch(`${API_BASE_URL}/members/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse),

    updateMember: (id: number, data: any) => fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse),

    deleteMember: (id: number) => fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'DELETE'
    }).then(handleResponse),

    // Abonnements
    createSubscription: (data: any) => fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse),

    updateSubscription: (id: number, data: any) => fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse)
} 