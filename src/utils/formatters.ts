export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'DT',
    }).format(amount);
};
export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR');
};
export const formattelephoneNumber = (telephone?: string): string => {
    if (!telephone) return '';
    // Remove all non-digit characters
    const digits = telephone.replace(/\D/g, '');
    // Get the last 8 digits
    const last8 = digits.slice(-8);
    if (last8.length < 8) return last8;
    // Format as 'XX XX XX XX'
    return last8.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};