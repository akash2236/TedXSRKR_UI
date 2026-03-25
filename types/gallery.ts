export interface GalleryImage {
    id: string;
    url: string;
    title: string;
    description?: string;
    category?: string;
}

export interface GalleryVideo {
    id: string;
    youtubeId: string;
    title: string;
    description?: string;
}
