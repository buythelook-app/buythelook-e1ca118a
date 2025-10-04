import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HomeButton } from "./HomeButton";
import { Package, TrendingUp, CheckCircle, Clock, Truck } from "lucide-react";
import { Badge } from "./ui/badge";

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "Processing":
      return <Clock className="h-4 w-4" />;
    case "Shipped":
      return <Truck className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "success" => {
  switch (status) {
    case "Delivered":
      return "success";
    case "Processing":
      return "secondary";
    case "Shipped":
      return "default";
    default:
      return "default";
  }
};

export const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fashion-neutral-dark to-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-fashion-primary/10"
          >
            ← Back
          </Button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-fashion-primary to-fashion-accent bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-muted-foreground mt-2">Track and manage your orders</p>
        </div>

        <Card className="mb-8 border-fashion-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fashion-primary">
              <TrendingUp className="h-5 w-5" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground"
                />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--fashion-primary) / 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="hsl(var(--fashion-primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Orders</h2>
          {mockOrders.map((order) => (
            <Card 
              key={order.id}
              className="hover:shadow-lg hover:shadow-fashion-primary/10 transition-all border-fashion-primary/20 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-fashion-accent" />
                      <p className="font-semibold text-lg">Order #{order.id}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold text-fashion-primary">${order.total}</p>
                    <Badge 
                      variant={getStatusVariant(order.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
