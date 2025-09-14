'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ShoppingCart, CreditCard } from "lucide-react"
import Image from "next/image"
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'

const CartConfirmationPopup = ({ 
    isOpen, 
    onClose, 
    selectedItems, 
    totalQty, 
    totalPrice, 
    onProceedToCart, 
    onProceedToCheckout,
    actionType = 'add' // 'add' or 'buy'
}) => {
    if (!selectedItems || selectedItems.length === 0) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {actionType === 'add' ? 'Items Added to Cart' : 'Ready to Checkout'}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Selected Items List */}
                    <div className="space-y-3">
                        {selectedItems.map((item, index) => (
                            <div key={`${item.color}-${item.size}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                                {/* Product Image */}
                                <div className="w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={item.media || imgPlaceholder.src}
                                        width={64}
                                        height={64}
                                        alt={`${item.color} - ${item.size}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                
                                {/* Item Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.color} - {item.size}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm">
                                            Qty: {item.qty}
                                        </span>
                                        <span className="text-sm font-medium">
                                            BDT {Number(item.price * item.qty).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Stock: {item.stock}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total ({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
                            <span>BDT {Number(totalPrice).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        Continue Shopping
                    </Button>
                    
                    {actionType === 'add' ? (
                        <>
                            <Button 
                                onClick={onProceedToCart}
                                className="w-full sm:w-auto"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                View Cart
                            </Button>
                            <Button 
                                onClick={onProceedToCheckout}
                                className="w-full sm:w-auto"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Checkout Now
                            </Button>
                        </>
                    ) : (
                        <Button 
                            onClick={onProceedToCheckout}
                            className="w-full sm:w-auto"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Checkout
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CartConfirmationPopup
