export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'DT',
    }).format(amount);
};
export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR');
};
export const formattelephoneNumber = (telephone: string): string => {
    return telephone.replace(/(\d{2})(?=\d)/g, '$1 ');
};