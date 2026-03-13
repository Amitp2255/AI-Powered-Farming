
import { Scheme } from '../types';

const schemesData: Scheme[] = [
    {
        id: 1, title: "PM-KISAN Scheme",
        summary: "Income support of ₹6,000 per year for all landholding farmer families, applicable to crop and horticulture farmers.",
        eligibility: "Landholding farmer families.",
        benefits: "Financial support for agriculture and allied activities.",
        applicationLink: "https://pmkisan.gov.in/"
    },
    {
        id: 2, title: "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
        summary: "A flagship scheme for focused and sustainable development of the fisheries sector (Blue Revolution).",
        eligibility: "Fishers, fish farmers, fish workers and fish vendors.",
        benefits: "Financial assistance for new ponds, inputs, boats, and safety kits for aquaculture.",
        applicationLink: "https://pmmsy.dof.gov.in/"
    },
    {
        id: 3, title: "National Horticulture Mission (NHM)",
        summary: "Promotes holistic growth of the horticulture sector including fruits, vegetables, root & tuber crops, mushrooms, spices, flowers, aromatic plants, coconut, cashew, cocoa and bamboo.",
        eligibility: "Farmers growing horticultural crops.",
        benefits: "Subsidy for planting material, greenhouse construction, and post-harvest management.",
        applicationLink: "https://midh.gov.in/"
    },
    {
        id: 4, title: "Silk Samagra (Sericulture)",
        summary: "Integrated Scheme for Development of Silk Industry covering Mulberry, Eri, Muga and Tasar.",
        eligibility: "Sericulture farmers, reelers, and weavers.",
        benefits: "Support for rearing houses, silkworm seeds, and reeling equipment.",
        applicationLink: "https://csb.gov.in/"
    },
    {
        id: 5, title: "National Beekeeping & Honey Mission (NBHM)",
        summary: "Promotes scientific beekeeping for pollination support and honey production.",
        eligibility: "Beekeepers and farmers adopting apiculture.",
        benefits: "Training and subsidy for bee boxes and colonies.",
        applicationLink: "https://nbhm.gov.in/"
    }
];

// Simulates fetching schemes from a backend.
export const getGovernmentSchemes = (): Promise<Scheme[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(schemesData);
        }, 500);
    });
};
