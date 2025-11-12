import React, { useState, useEffect } from 'react';
import { Order, CartItem } from '../../types';
import { youwareService } from '../../services/youwareService';
import { useNotification } from '../../contexts/AppContext';
import { useI18n } from '../../contexts/I18nContext';

const OrderItemRow: React.FC<{item: CartItem; order: Order}> = ({ item, order }) => {
    const { addNotification } = useNotification();
    const { t } = useI18n();

    const handleAddToFulfillment = () => {
        const fulfillmentItem = {
            id: `${order.id}_${item.cartItemId}`,
            productName: item.product.name,
            supplierUrl: item.product.supplierInfo.url,
            quantity: item.quantity,
            customerName: order.userName,
            customerAddress: order.userAddress,
            orderId: order.id,
        };
        const addedItem = youwareService.addToFulfillmentCart(fulfillmentItem);
        if (addedItem) {
            addNotification(t('adminOrders.addedToFulfillment'), 'success');
        } else {
            addNotification("This item is already in the fulfillment list.", 'info');
        }
    };
    
    return (
        <div className="flex items-center gap-4 py-2">
            <img src={item.selectedImage} alt={item.product.name} className="w-12 h-12 object-cover rounded-md" />
            <div>
                <p className="font-semibold">{item.product.name} <span className="text-sm text-textSecondary">(x{item.quantity})</span></p>
                <p className="text-xs text-textSecondary">{Object.values(item.selectedOptions).join(', ')}</p>
            </div>
            {item.product.productType === 'dropship' && (
                <div className="ml-auto flex items-center gap-4">
                     <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                        Dropship Item
                     </span>
                     <button
                        onClick={handleAddToFulfillment}
                        className="bg-primary text-background text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-80 transition"
                     >
                        {t('adminOrders.addToFulfillment')}
                     </button>
                </div>
            )}
        </div>
    );
}


export const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const { addNotification } = useNotification();
    const { t } = useI18n();

    useEffect(() => {
        setOrders(youwareService.getAllOrders());
    }, []);

    const handleStatusChange = (orderId: string, newStatus: Order['status'], originalStatus: Order['status'], event: React.ChangeEvent<HTMLSelectElement>) => {
        if (newStatus === 'Cancelled') {
            if (!window.confirm(t('adminOrders.cancelConfirm'))) {
                // If admin cancels the confirmation, revert the select element
                event.target.value = originalStatus;
                return;
            }
        }
        
        const updatedOrder = youwareService.updateOrderStatus(orderId, newStatus);
        if (updatedOrder) {
            // Send a notification to the user
            youwareService.addUserNotification({
                userId: updatedOrder.userId,
                message: `The status of your order #${updatedOrder.id.slice(-6)} has been updated to ${newStatus}.`,
                link: `/order-confirmation/${updatedOrder.id}`
            });
            setOrders(youwareService.getAllOrders());
            addNotification(`Order status updated to ${newStatus}`, 'info');
        }
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Shipped': return 'bg-blue-500/20 text-blue-400';
            case 'Delivered': return 'bg-green-500/20 text-green-400';
            case 'Cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-textSecondary';
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
            <div className="bg-surface shadow-md rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4 w-12"></th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className="border-b border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                        <td className="p-4 text-center text-primary">{expandedOrderId === order.id ? '−' : '+'}</td>
                                        <td className="p-4 font-semibold text-primary">{order.id.slice(-6)}</td>
                                        <td className="p-4">{order.userName}<br/><span className="text-xs text-textSecondary">{order.userPhone}</span></td>
                                        <td className="p-4 text-textSecondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 font-semibold">Tk {order.grandTotal.toFixed(2)}</td>
                                        <td className="p-4">
                                            <select 
                                                value={order.status} 
                                                onClick={(e) => e.stopPropagation()} // Prevent row click from triggering
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'], order.status, e)}
                                                className={`px-2 py-1 rounded-md text-sm border-2 border-transparent focus:outline-none focus:border-primary ${getStatusColor(order.status)} bg-surface`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-background">
                                            <td colSpan={6} className="p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Order Details:</h4>
                                                        <p className="text-sm"><span className="text-textSecondary">Address:</span> {order.userAddress}</p>
                                                        <p className="text-sm"><span className="text-textSecondary">Payment:</span> {order.paymentMethod}</p>
                                                        {order.transactionId && <p className="text-sm"><span className="text-textSecondary">TrxID:</span> <span className="font-mono text-accent">{order.transactionId}</span></p>}
                                                         {order.codFee && order.codFee > 0 && <p className="text-sm"><span className="text-textSecondary">COD Fee:</span> Tk {order.codFee.toFixed(2)}</p>}
                                                        {order.couponCode && <p className="text-sm"><span className="text-textSecondary">Coupon:</span> {order.couponCode} (-Tk {order.couponDiscount.toFixed(2)})</p>}
                                                    </div>
                                                    <div className="divide-y divide-white/10">
                                                        <h4 className="font-semibold mb-2">Order Items:</h4>
                                                        {order.items.map(item => <OrderItemRow key={item.cartItemId} item={item} order={order} />)}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {orders.length === 0 && <p className="p-4 text-center text-textSecondary">No orders found.</p>}
            </div>
        </div>
    );
};
