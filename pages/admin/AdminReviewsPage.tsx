import React, { useState, useEffect } from 'react';
import { Review } from '../../types';
import { youwareService } from '../../services/youwareService';
import { StarIcon } from '../../components/Icons';
import { useProducts } from '../../contexts/AppContext';

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i <= rating} />);
    }
    return stars;
};

export const AdminReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const { refreshProducts } = useProducts();

    useEffect(() => {
        setReviews(youwareService.getAllReviews());
    }, []);

    const handleDelete = (reviewId: string, comment: string) => {
        if (window.confirm(`Are you sure you want to delete this review?\n"${comment}"`)) {
            youwareService.deleteReview(reviewId);
            setReviews(youwareService.getAllReviews());
            refreshProducts(); // Refresh products to update ratings
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Reviews</h1>
             <div className="bg-surface shadow-md rounded-lg border border-white/10">
                <div className="p-4 space-y-6">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="border border-white/10 p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-primary">{review.productName}</p>
                                    <div className="flex items-center my-1">
                                        {renderStars(review.rating)}
                                        <p className="ml-4 font-semibold text-sm text-textPrimary">{review.userName}</p>
                                    </div>
                                    <p className="text-textSecondary italic">"{review.comment}"</p>
                                    <p className="text-gray-500 text-xs mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(review.id, review.comment)}
                                    className="text-secondary hover:text-opacity-80 font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-textSecondary">No reviews have been submitted yet.</p>
                    )}
                </div>
             </div>
        </div>
    );
};
