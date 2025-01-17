import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

export const ShippingAddress = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Address Updated",
      description: "Your shipping address has been updated successfully.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-netflix-card text-netflix-text">
        <DialogHeader>
          <DialogTitle>Update Shipping Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Street Address"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            className="bg-netflix-background"
          />
          <Input
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="bg-netflix-background"
          />
          <Input
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="bg-netflix-background"
          />
          <Input
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
            className="bg-netflix-background"
          />
          <Button type="submit" className="w-full">Save Address</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};