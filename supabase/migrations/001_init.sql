-- Pizza Website Database Schema
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PIZZAS TABLE (Menu Items)
-- ============================================
CREATE TABLE pizzas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'classic',
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOPPINGS TABLE
-- ============================================
CREATE TABLE toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT DEFAULT 'extra',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIZZA TOPPINGS (Pre-configured toppings for each pizza)
-- ============================================
CREATE TABLE pizza_toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pizza_id UUID REFERENCES pizzas(id) ON DELETE CASCADE,
    topping_id UUID REFERENCES toppings(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pizza_id, topping_id)
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_instructions TEXT,
    order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    pizza_id UUID REFERENCES pizzas(id) ON DELETE SET NULL,
    pizza_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEM TOPPINGS (Extra toppings for each order item)
-- ============================================
CREATE TABLE order_item_toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    topping_id UUID REFERENCES toppings(id) ON DELETE SET NULL,
    topping_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_pizzas_category ON pizzas(category);
CREATE INDEX idx_pizzas_available ON pizzas(is_available);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_item_toppings_order_item_id ON order_item_toppings(order_item_id);
CREATE INDEX idx_pizza_toppings_pizza_id ON pizza_toppings(pizza_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE pizzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pizza_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_toppings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC POLICIES (Read access for menu items)
-- ============================================

-- Pizzas: Public read access
CREATE POLICY "Pizzas are viewable by everyone" ON pizzas
    FOR SELECT USING (true);

-- Toppings: Public read access
CREATE POLICY "Toppings are viewable by everyone" ON toppings
    FOR SELECT USING (true);

-- Pizza Toppings: Public read access
CREATE POLICY "Pizza toppings are viewable by everyone" ON pizza_toppings
    FOR SELECT USING (true);

-- ============================================
-- ORDER POLICIES
-- ============================================

-- Orders: Anyone can create orders (public submission)
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Orders: Anyone can view their own orders (by email)
-- Note: In production, you'd use authentication. This allows order tracking by email.
CREATE POLICY "Orders are viewable by public" ON orders
    FOR SELECT USING (true);

-- Orders: Only authenticated admins can update (we'll handle this via service role)
-- For now, allow updates for order status changes
CREATE POLICY "Orders can be updated" ON orders
    FOR UPDATE USING (true);

-- Order Items: Anyone can create order items
CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Order Items: Public read access
CREATE POLICY "Order items are viewable by public" ON order_items
    FOR SELECT USING (true);

-- Order Item Toppings: Anyone can create
CREATE POLICY "Anyone can create order item toppings" ON order_item_toppings
    FOR INSERT WITH CHECK (true);

-- Order Item Toppings: Public read access
CREATE POLICY "Order item toppings are viewable by public" ON order_item_toppings
    FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pizzas table
CREATE TRIGGER update_pizzas_updated_at
    BEFORE UPDATE ON pizzas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Initial menu items)
-- ============================================

-- Insert sample pizzas
INSERT INTO pizzas (name, description, image_url, base_price, category, is_popular) VALUES
('Margherita', 'Fresh tomatoes, mozzarella cheese, and basil on our signature crust', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', 12.99, 'classic', true),
('Pepperoni', 'Loaded with premium pepperoni and mozzarella cheese', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', 14.99, 'meat', true),
('Supreme', 'Pepperoni, sausage, bell peppers, onions, and olives', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', 17.99, 'specialty', true),
('Hawaiian', 'Ham, pineapple, and mozzarella cheese', 'https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=500', 15.99, 'specialty', false),
('BBQ Chicken', 'Grilled chicken, BBQ sauce, red onions, and cilantro', 'https://images.unsplash.com/photo-1594007654729-409eed93a262?w=500', 16.99, 'specialty', true),
('Veggie Delight', 'Bell peppers, mushrooms, onions, olives, tomatoes, and spinach', 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=500', 14.99, 'veggie', false),
('Meat Lovers', 'Pepperoni, sausage, bacon, ham, and ground beef', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500', 18.99, 'meat', true),
('White Pizza', 'Ricotta, mozzarella, garlic, and spinach on white sauce base', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500', 15.99, 'specialty', false),
('Buffalo Chicken', 'Spicy buffalo sauce, grilled chicken, and blue cheese crumbles', 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500', 16.99, 'specialty', false),
('Four Cheese', 'Mozzarella, parmesan, gorgonzola, and fontina', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', 15.99, 'classic', false);

-- Insert sample toppings
INSERT INTO toppings (name, price, category) VALUES
('Extra Cheese', 1.50, 'cheese'),
('Pepperoni', 1.75, 'meat'),
('Italian Sausage', 2.00, 'meat'),
('Bacon', 2.00, 'meat'),
('Ham', 1.75, 'meat'),
('Grilled Chicken', 2.50, 'meat'),
('Ground Beef', 2.25, 'meat'),
('Mushrooms', 1.00, 'veggie'),
('Bell Peppers', 1.00, 'veggie'),
('Onions', 0.75, 'veggie'),
('Black Olives', 1.00, 'veggie'),
('Jalapeños', 1.00, 'veggie'),
('Spinach', 1.00, 'veggie'),
('Pineapple', 1.00, 'veggie'),
('Tomatoes', 0.75, 'veggie'),
('Garlic', 0.50, 'veggie'),
('Anchovies', 2.00, 'seafood'),
('Shrimp', 3.00, 'seafood');

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for pizzas with their toppings
CREATE VIEW pizzas_with_toppings AS
SELECT 
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', t.id,
                'name', t.name,
                'price', t.price,
                'is_included', pt.is_included
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as toppings
FROM pizzas p
LEFT JOIN pizza_toppings pt ON p.id = pt.pizza_id
LEFT JOIN toppings t ON pt.topping_id = t.id
GROUP BY p.id;

-- View for orders with items
CREATE VIEW orders_with_items AS
SELECT 
    o.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'pizza_name', oi.pizza_name,
                'quantity', oi.quantity,
                'size', oi.size,
                'unit_price', oi.unit_price,
                'subtotal', oi.subtotal,
                'special_instructions', oi.special_instructions,
                'toppings', (
                    SELECT COALESCE(
                        json_agg(
                            json_build_object(
                                'name', oit.topping_name,
                                'price', oit.price
                            )
                        ),
                        '[]'::json
                    )
                    FROM order_item_toppings oit
                    WHERE oit.order_item_id = oi.id
                )
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE pizzas IS 'Menu items - available pizzas for ordering';
COMMENT ON TABLE toppings IS 'Available toppings that can be added to any pizza';
COMMENT ON TABLE pizza_toppings IS 'Pre-configured toppings for each pizza (included by default)';
COMMENT ON TABLE orders IS 'Customer orders with delivery/pickup information';
COMMENT ON TABLE order_items IS 'Individual pizza items within an order';
COMMENT ON TABLE order_item_toppings IS 'Extra toppings added to specific order items';