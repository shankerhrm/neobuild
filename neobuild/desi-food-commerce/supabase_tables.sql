-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cuisine_types TEXT[] DEFAULT '{}',
    delivery_radius DECIMAL(3, 1) DEFAULT 2.0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dishes table
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image_url TEXT,
    category VARCHAR(100) NOT NULL,
    dietary_info VARCHAR(50) DEFAULT 'Veg',
    is_available BOOLEAN DEFAULT true,
    prep_time INTEGER DEFAULT 15, -- in minutes
    serves INTEGER DEFAULT 1,
    calories INTEGER DEFAULT 0,
    protein DECIMAL(5, 2) DEFAULT 0.0, -- in grams
    carbs DECIMAL(5, 2) DEFAULT 0.0, -- in grams
    fat DECIMAL(5, 2) DEFAULT 0.0, -- in grams
    rating DECIMAL(2, 1) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    items JSONB NOT NULL, -- Array of {dish_id, dish_name, quantity, price}
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, out_for_delivery, delivered, cancelled
    payment_method VARCHAR(20) DEFAULT 'cod', -- cod, upi
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    delivery_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    notes TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
    tax_amount DECIMAL(10, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- cod, upi
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
    discount_amount DECIMAL(10, 2) DEFAULT 0.0,
    final_amount DECIMAL(10, 2) NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_is_active ON providers(is_active);
CREATE INDEX idx_dishes_provider_id ON dishes(provider_id);
CREATE INDEX idx_dishes_category ON dishes(category);
CREATE INDEX idx_dishes_is_available ON dishes(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_provider_id ON orders(provider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_provider_id ON payments(provider_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_provider_id ON invoices(provider_id);
CREATE INDEX idx_reviews_dish_id ON reviews(dish_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers policies
CREATE POLICY "Providers can view own data" ON providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can update own data" ON providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can insert own data" ON providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view active providers" ON providers FOR SELECT USING (is_active = true AND is_verified = true);

-- Dishes policies
CREATE POLICY "Providers can manage own dishes" ON dishes FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view available dishes" ON dishes FOR SELECT USING (is_available = true AND provider_id IN (SELECT id FROM providers WHERE is_active = true AND is_verified = true));

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can view their orders" ON orders FOR SELECT USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Providers can update their orders" ON orders FOR UPDATE USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can view their payments" ON payments FOR SELECT USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "System can manage payments" ON payments FOR ALL USING (true);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can manage their invoices" ON invoices FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Reviews policies
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view all reviews" ON reviews FOR SELECT USING (true);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create payment and invoice after order is delivered
CREATE OR REPLACE FUNCTION handle_order_delivery()
RETURNS TRIGGER AS $$
DECLARE
    payment_id UUID;
    invoice_number VARCHAR;
BEGIN
    -- Only proceed if status changed to 'delivered'
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        
        -- Create payment record
        INSERT INTO payments (
            order_id,
            user_id,
            provider_id,
            amount,
            payment_method,
            payment_status,
            paid_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.provider_id,
            NEW.total_amount,
            NEW.payment_method,
            CASE WHEN NEW.payment_method = 'cod' THEN 'paid' ELSE NEW.payment_status END,
            CASE WHEN NEW.payment_method = 'cod' THEN NOW() ELSE NULL END
        ) RETURNING id INTO payment_id;
        
        -- Generate invoice number
        invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_sequence')::TEXT, 6, '0');
        
        -- Create invoice record
        INSERT INTO invoices (
            order_id,
            payment_id,
            user_id,
            provider_id,
            invoice_number,
            total_amount,
            tax_amount,
            delivery_fee,
            discount_amount,
            final_amount,
            due_date,
            status
        ) VALUES (
            NEW.id,
            payment_id,
            NEW.user_id,
            NEW.provider_id,
            invoice_number,
            NEW.total_amount,
            NEW.tax_amount,
            NEW.delivery_fee,
            0, -- discount_amount
            NEW.total_amount,
            NOW() + INTERVAL '30 days',
            CASE WHEN NEW.payment_method = 'cod' THEN 'paid' ELSE 'sent' END
        );
        
        -- Update provider total orders
        UPDATE providers 
        SET total_orders = total_orders + 1
        WHERE id = NEW.provider_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Trigger for order delivery
CREATE TRIGGER handle_order_delivery_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_delivery();

-- Sample data insertion (optional)
-- Insert sample provider
INSERT INTO users (id, email, full_name, phone, address) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'provider@example.com', 'Sample Provider', '+91 98765 43210', '123 Provider Street, City');

INSERT INTO providers (id, user_id, business_name, business_address, phone, email, cuisine_types, is_verified, is_active, rating) VALUES 
('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Desi Kitchen', '123 Provider Street, City', '+91 98765 43210', 'provider@example.com', '{"North Indian", "Punjabi"}', true, true, 4.5);

-- Insert sample dishes
INSERT INTO dishes (provider_id, name, description, price, original_price, category, dietary_info, prep_time, serves, calories, protein, carbs, fat) VALUES 
('123e4567-e89b-12d3-a456-426614174001', 'Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 280, 320, 'Main Course', 'Non-Veg', 25, 2, 450, 35, 15, 25),
('123e4567-e89b-12d3-a456-426614174001', 'Dal Makhani', 'Rich and creamy black lentils slow-cooked with butter', 220, NULL, 'Main Course', 'Veg', 20, 2, 380, 18, 45, 15),
('123e4567-e89b-12d3-a456-426614174001', 'Paneer Tikka', 'Marinated cottage cheese cubes grilled to perfection', 240, NULL, 'Appetizers', 'Veg', 18, 2, 320, 22, 12, 18),
('123e4567-e89b-12d3-a456-426614174001', 'Garlic Naan', 'Fresh baked bread with garlic and butter', 45, NULL, 'Bread', 'Veg', 10, 1, 180, 5, 30, 4),
('123e4567-e89b-12d3-a456-426614174001', 'Masala Chai', 'Traditional Indian tea with aromatic spices', 30, NULL, 'Beverages', 'Veg', 5, 1, 80, 3, 12, 2);

-- Insert sample customer
INSERT INTO users (id, email, full_name, phone, address) VALUES 
('123e4567-e89b-12d3-a456-426614174002', 'customer@example.com', 'Sample Customer', '+91 87654 32109', '456 Customer Avenue, City');
