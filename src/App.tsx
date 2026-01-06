import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import FoodItems from "./pages/FoodItems";
import Ingredients from "./pages/Ingredients";
import RecipeManagement from "./pages/RecipeManagement";
import StoreStock from "./pages/StoreStock";
import KitchenStock from "./pages/KitchenStock";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import StaffManagement from "./pages/StaffManagement";
import RestaurantSettings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/food-items" element={<FoodItems />} />
            <Route path="/menu" element={<FoodItems />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/recipes" element={<RecipeManagement />} />
            <Route path="/store-stock" element={<StoreStock />} />
            <Route path="/stock" element={<StoreStock />} />
            <Route path="/kitchen-stock" element={<KitchenStock />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/settings" element={<RestaurantSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
