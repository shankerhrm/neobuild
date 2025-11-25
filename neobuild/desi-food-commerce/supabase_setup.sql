-- =============================================
-- SUPABASE DATABASE SETUP FOR DESI FOOD COMMERCE
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
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

-- =============================================
-- PROVIDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cuisine_types TEXT[] DEFAULT '{}',
    delivery_radius DECIMAL(3, 1) DEFAULT 2.0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DISHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dishes (
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

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
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

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
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

-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS invoices (
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

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
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

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_dishes_provider_id ON dishes(provider_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_is_available ON dishes(is_available);
CREATE INDEX IF NOT EXISTS idx_dishes_search ON dishes USING GIN (to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_provider_id ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR USERS
-- =============================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- RLS POLICIES FOR PROVIDERS
-- =============================================
DROP POLICY IF EXISTS "Providers can view own data" ON providers;
CREATE POLICY "Providers can view own data" ON providers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can update own data" ON providers;
CREATE POLICY "Providers can update own data" ON providers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can insert own data" ON providers;
CREATE POLICY "Providers can insert own data" ON providers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active providers" ON providers;
CREATE POLICY "Anyone can view active providers" ON providers FOR SELECT USING (is_active = true AND is_verified = true);

-- =============================================
-- RLS POLICIES FOR DISHES
-- =============================================
DROP POLICY IF EXISTS "Providers can manage own dishes" ON dishes;
CREATE POLICY "Providers can manage own dishes" ON dishes FOR ALL USING (
    provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Anyone can view available dishes" ON dishes;
CREATE POLICY "Anyone can view available dishes" ON dishes FOR SELECT USING (
    is_available = true AND provider_id IN (
        SELECT id FROM providers WHERE is_active = true AND is_verified = true
    )
);

-- =============================================
-- RLS POLICIES FOR ORDERS
-- =============================================
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can view their orders" ON orders;
CREATE POLICY "Providers can view their orders" ON orders FOR SELECT USING (
    provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Providers can update their orders" ON orders;
CREATE POLICY "Providers can update their orders" ON orders FOR UPDATE USING (
    provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    )
);

-- =============================================
-- RLS POLICIES FOR PAYMENTS
-- =============================================
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can view their payments" ON payments;
CREATE POLICY "Providers can view their payments" ON payments FOR SELECT USING (
    provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "System can manage payments" ON payments;
CREATE POLICY "System can manage payments" ON payments FOR ALL USING (true);

-- =============================================
-- RLS POLICIES FOR INVOICES
-- =============================================
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can manage their invoices" ON invoices;
CREATE POLICY "Providers can manage their invoices" ON invoices FOR ALL USING (
    provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    )
);

-- =============================================
-- RLS POLICIES FOR REVIEWS
-- =============================================
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view all reviews" ON reviews;
CREATE POLICY "Anyone can view all reviews" ON reviews FOR SELECT USING (true);

-- =============================================
-- CREATE FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle order status changes and create payments/invoices
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
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)), 0) + 1
        INTO invoice_number
        FROM invoices
        WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-%';
        
        invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(invoice_number::TEXT, 6, '0');
        
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

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at 
    BEFORE UPDATE ON providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
CREATE TRIGGER update_dishes_updated_at 
    BEFORE UPDATE ON dishes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for order delivery handling
DROP TRIGGER IF EXISTS handle_order_delivery_trigger ON orders;
CREATE TRIGGER handle_order_delivery_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_delivery();

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample provider user
INSERT INTO users (id, email, full_name, phone, address) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'provider@desifoods.com', 'Desi Kitchen Provider', '+91 98765 43210', '123 Food Street, Mumbai, Maharashtra - 400001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample provider
INSERT INTO providers (id, user_id, business_name, business_address, phone, email, cuisine_types, is_verified, is_active, rating) VALUES 
('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Desi Kitchen', '123 Food Street, Mumbai, Maharashtra - 400001', '+91 98765 43210', 'provider@desifoods.com', '{"North Indian", "Punjabi", "Street Food"}', true, true, 4.5)
ON CONFLICT (id) DO NOTHING;

-- Insert sample dishes
INSERT INTO dishes (id, provider_id, name, description, price, original_price, category, dietary_info, prep_time, serves, calories, protein, carbs, fat, image_url) VALUES 
('dish_001', '123e4567-e89b-12d3-a456-426614174001', 'Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces, served with aromatic spices and herbs.', 280.00, 320.00, 'Main Course', 'Non-Veg', 25, 2, 450, 35.0, 15.0, 25.0, 'https://placehold.co/300x200'),
('dish_002', '123e4567-e89b-12d3-a456-426614174001', 'Dal Makhani', 'Rich and creamy black lentils slow-cooked with butter and cream, a true Punjabi delight.', 220.00, NULL, 'Main Course', 'Veg', 20, 2, 380, 18.0, 45.0, 15.0, 'https://placehold.co/300x200'),
('dish_003', '123e4567-e89b-12d3-a456-426614174001', 'Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken, cooked to perfection with authentic spices.', 350.00, NULL, 'Rice', 'Non-Veg', 35, 1, 650, 40.0, 75.0, 20.0, 'https://placehold.co/300x200'),
('dish_004', '123e4567-e89b-12d3-a456-426614174001', 'Paneer Tikka', 'Marinated cottage cheese cubes grilled to perfection with bell peppers and onions.', 240.00, NULL, 'Appetizers', 'Veg', 18, 2, 320, 22.0, 12.0, 18.0, 'https://placehold.co/300x200'),
('dish_005', '123e4567-e89b-12d3-a456-426614174001', 'Masala Chai', 'Traditional Indian tea brewed with aromatic spices, milk, and love.', 30.00, NULL, 'Beverages', 'Veg', 5, 1, 80, 3.0, 12.0, 2.0, 'https://placehold.co/300x200'),
('dish_006', '123e4567-e89b-12d3-a456-426614174001', 'Gulab Jamun', 'Soft, spongy milk dumplings soaked in aromatic sugar syrup, a perfect sweet ending.', 120.00, NULL, 'Desserts', 'Veg', 15, 4, 180, 4.0, 35.0, 8.0, 'https://placehold.co/300x200'),
('dish_007', '123e4567-e89b-12d3-a456-426614174001', 'Garlic Naan', 'Fresh baked bread with garlic and butter.', 45.00, NULL, 'Bread', 'Veg', 10, 1, 180, 5.0, 30.0, 4.0, 'https://placehold.co/300x200'),
('dish_008', '123e4567-e89b-12d3-a456-426614174001', 'Rajma Chawal', 'Kidney beans curry served with steamed basmati rice.', 180.00, NULL, 'Main Course', 'Veg', 25, 1, 420, 16.0, 65.0, 8.0, 'https://placehold.co/300x200'),
('dish_009', '123e4567-e89b-12d3-a456-426614174001', 'Tandoori Chicken', 'Chicken marinated in yogurt and spices, cooked in tandoor.', 320.00, 380.00, 'Main Course', 'Non-Veg', 30, 2, 380, 45.0, 8.0, 18.0, 'https://placehold.co/300x200'),
('dish_010', '123e4567-e89b-12d3-a456-426614174001', 'Mango Lassi', 'Refreshing yogurt-based drink with sweet mango.', 80.00, NULL, 'Beverages', 'Veg', 5, 1, 120, 4.0, 22.0, 3.0, 'https://placehold.co/300x200')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customer user
INSERT INTO users (id, email, full_name, phone, address) VALUES 
('customer_001', 'customer@example.com', 'John Doe', '+91 87654 32109', '456 Customer Avenue, Delhi, India - 110001')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables to anon for public data
GRANT SELECT ON dishes TO anon;
GRANT SELECT ON providers TO anon;
GRANT SELECT ON reviews TO anon;

-- Grant full access to authenticated users (controlled by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Desi Food Commerce database setup completed successfully!';
    RAISE NOTICE 'Tables created: users, providers, dishes, orders, payments, invoices, reviews';
    RAISE NOTICE 'Sample data inserted with provider and dishes available';
    RAISE NOTICE 'RLS policies configured for security';
    RAISE NOTICE 'You can now use the application!';
END $$;