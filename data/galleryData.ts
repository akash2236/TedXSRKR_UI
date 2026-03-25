import { GalleryImage, GalleryVideo } from '../types/gallery';

// Manually update this array to add or remove images from the gallery
// Images should be placed in the public folder, e.g., /gallery/image1.jpg
export const GALLERY_IMAGES: GalleryImage[] = [
    {
        id: 'img-1',
        url: '/galary/open1.webp',
        title: 'Opening Ceremony',
        description: 'Chief Guest: Saina Nehwal, Badminton Player',
        category: 'Opening Ceremony'
    },
    {
        id: 'img-2',
        url: '/galary/open3.webp',
        title: 'Chief Guest Address',
        description: 'Saina Nehwal inspiring the audience',
        category: 'Opening Ceremony'
    },
    {
        id: 'img-3',
        url: '/galary/open2.webp',
        title: 'Lighting the Lamp',
        description: 'Inauguration by Chief Guest Saina Nehwal',
        category: 'Opening Ceremony'
    }
];

// Manually update this array to add or remove YouTube videos
export const GALLERY_VIDEOS: GalleryVideo[] = [
    {
        id: 'vid-1',
        youtubeId: '', // Replace with actual TEDx youtube ID
        title: 'Sample TEDx Talk 1',
        description: 'An inspiring talk about the future of technology'
    },
    {
        id: 'vid-2',
        youtubeId: '', // Replace with actual TEDx youtube ID
        title: 'Sample TEDx Talk 2',
        description: 'Insights into human resilience and creativity'
    }
];
