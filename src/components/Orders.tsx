import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { HomeButton } from "./HomeButton";

const mockOrders = [
  { id: 1, date: "2024-01-01", total: 150, status: "Delivered" },
  { id: 2, date: "2024-02-01", total: 200, status: "Processing" },
  { id: 3, date: "2024-03-01", total: 175, status: "Shipped" },
];

const orderStats = [
  { month: "Jan", orders: 2 },
  { month: "Feb", orders: 4 },
  { month: "Mar", orders: 3 },
];

export const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

        <div className="bg-netflix-card p-4 rounded-lg mb-8">
          <h2 className="text-lg font-medium mb-4">Order Statistics</h2>
          <BarChart width={600} height={300} data={orderStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#E50914" />
          </BarChart>
        </div>

        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div 
              key={order.id}
              className="bg-netflix-card p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-400">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-netflix-accent">${order.total}</p>
                <p className="text-sm">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
