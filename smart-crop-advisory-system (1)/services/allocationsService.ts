import { Allocation } from '../types';

const allocationsData: Allocation[] = [
    {
        id: 'alloc_seed_1',
        item: 'Certified Wheat Seeds',
        quantity: '50 KG',
        status: 'Allocated',
        date: '2024-10-15',
    },
    {
        id: 'alloc_fert_1',
        item: 'Urea Fertilizer',
        quantity: '2 Bags (45kg each)',
        status: 'Delivered',
        date: '2024-10-05',
    },
    {
        id: 'alloc_subsidy_1',
        item: 'PM-Kisan Installment',
        quantity: '₹2000',
        status: 'Delivered',
        date: '2024-09-01',
    },
    {
        id: 'alloc_seed_2',
        item: 'Soybean Seeds (Kharif)',
        quantity: '30 KG',
        status: 'Pending',
        date: '2025-05-20',
    }
];

// Simulates fetching allocations from a backend that an admin would manage.
export const getAllocations = (): Promise<Allocation[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(allocationsData);
        }, 800);
    });
};
