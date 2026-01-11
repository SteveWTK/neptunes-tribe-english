-- =====================================================
-- HABITAT NATURALIST SYSTEM - Complete Database Schema
-- Created: January 11, 2026
-- Purpose: Avatar system, observations, challenges, IUCN progression
-- =====================================================

-- =====================================================
-- 1. SPECIES AVATARS (Endangered species students can choose)
-- =====================================================
CREATE TABLE IF NOT EXISTS species_avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Species Information
    common_name TEXT NOT NULL,                    -- "Northern Muriqui"
    common_name_pt TEXT,                          -- "Muriqui-do-norte"
    scientific_name TEXT NOT NULL,                -- "Brachyteles hypoxanthus"

    -- Classification
    family TEXT,                                  -- "Atelidae"
    habitat TEXT,                                 -- "Atlantic Forest, Brazil"
    region_code TEXT,                             -- "BR" - links to eco-map

    -- IUCN Status (starting point for users who choose this species)
    iucn_status TEXT NOT NULL CHECK (iucn_status IN (
        'EX',   -- Extinct
        'EW',   -- Extinct in Wild
        'CR',   -- Critically Endangered
        'EN',   -- Endangered
        'VU',   -- Vulnerable
        'NT',   -- Near Threatened
        'LC'    -- Least Concern
    )),

    -- Visual Assets
    avatar_image_url TEXT,                        -- Main avatar image
    avatar_icon_url TEXT,                         -- Small icon version
    habitat_image_url TEXT,                       -- Background image of habitat

    -- Educational Content
    description TEXT,                             -- About this species
    fun_fact TEXT,                                -- Engaging fact
    conservation_note TEXT,                       -- Why they're endangered

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_species_avatars_active ON species_avatars(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_species_avatars_iucn ON species_avatars(iucn_status);

-- =====================================================
-- 2. USER SPECIES JOURNEY (User's avatar and IUCN progression)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_species_journey (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    species_avatar_id UUID NOT NULL REFERENCES species_avatars(id),

    -- IUCN Status Progression
    current_iucn_status TEXT NOT NULL CHECK (current_iucn_status IN (
        'EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC'
    )),
    starting_iucn_status TEXT NOT NULL,           -- Original status when selected

    -- Points System
    total_points INTEGER DEFAULT 0,
    points_to_next_level INTEGER DEFAULT 1000,    -- Points needed to improve IUCN status

    -- Progress within current level (0-100%)
    level_progress INTEGER DEFAULT 0,

    -- Stats
    observations_count INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,

    -- Narrative tracking
    last_narrative_shown TEXT,                    -- ID of last narrative message
    narrative_stage INTEGER DEFAULT 1,            -- Current stage of the story

    -- Timestamps
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    last_status_change TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One journey per user
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_journey_user ON user_species_journey(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_status ON user_species_journey(current_iucn_status);

-- =====================================================
-- 3. IUCN STATUS THRESHOLDS (Points needed for each level)
-- =====================================================
CREATE TABLE IF NOT EXISTS iucn_thresholds (
    id SERIAL PRIMARY KEY,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    points_required INTEGER NOT NULL,
    narrative_message TEXT,                       -- Message when reaching this status
    narrative_message_pt TEXT,                    -- Portuguese version

    UNIQUE(from_status, to_status)
);

-- Insert default thresholds (moving UP toward LC)
INSERT INTO iucn_thresholds (from_status, to_status, points_required, narrative_message, narrative_message_pt) VALUES
    ('CR', 'EN', 1000, 'Great progress! The {species} population is stabilizing. Keep going!', 'Ótimo progresso! A população de {species} está se estabilizando. Continue assim!'),
    ('EN', 'VU', 2000, 'Wonderful news! The {species} are no longer endangered. Your efforts are making a real difference!', 'Ótimas notícias! Os {species} não estão mais em perigo. Seus esforços estão fazendo uma diferença real!'),
    ('VU', 'NT', 3000, 'Amazing! The {species} population is recovering well. They''re almost out of danger!', 'Incrível! A população de {species} está se recuperando bem. Eles estão quase fora de perigo!'),
    ('NT', 'LC', 4000, 'Congratulations! You saved the {species}! They are now thriving in the wild!', 'Parabéns! Você salvou os {species}! Eles agora estão prosperando na natureza!')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- =====================================================
-- 4. NGO ORGANIZATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Organization Info
    name TEXT NOT NULL,
    name_pt TEXT,
    description TEXT,
    description_pt TEXT,

    -- Visual
    logo_url TEXT,
    banner_image_url TEXT,

    -- Contact
    website TEXT,
    contact_email TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    partnership_start DATE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. NGO CHALLENGES (Habitat-managed challenges with NGO videos)
-- =====================================================
CREATE TABLE IF NOT EXISTS ngo_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID REFERENCES ngos(id),

    -- Challenge Info
    title TEXT NOT NULL,
    title_pt TEXT,
    description TEXT NOT NULL,
    description_pt TEXT,

    -- NGO Video (embedded in challenge detail page)
    video_url TEXT,                               -- YouTube/Vimeo embed URL
    video_thumbnail_url TEXT,

    -- Challenge Parameters
    challenge_type TEXT DEFAULT 'observation' CHECK (challenge_type IN (
        'observation',     -- Upload observations
        'species_count',   -- Find X different species
        'location_count',  -- Observe from X locations
        'themed'           -- Specific theme (e.g., "marine life")
    )),

    -- Requirements
    target_count INTEGER DEFAULT 1,               -- How many observations needed
    target_species TEXT[],                        -- Specific species to find (optional)
    target_regions TEXT[],                        -- Specific regions (optional)

    -- Rewards
    points_reward INTEGER DEFAULT 100,
    bonus_points INTEGER DEFAULT 0,               -- Extra points for early completion

    -- Timing
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,

    -- Display
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,

    -- Map Display (for eco-map overlay)
    map_region_code TEXT,                         -- Region to highlight on map
    map_coordinates JSONB,                        -- {lat, lng} for marker

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ngo_challenges_active ON ngo_challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ngo_challenges_ngo ON ngo_challenges(ngo_id);

-- =====================================================
-- 6. UNPREDICTABLE CHALLENGES (Random high-value challenges)
-- =====================================================
CREATE TABLE IF NOT EXISTS unpredictable_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Challenge Info
    title TEXT NOT NULL,
    title_pt TEXT,
    description TEXT NOT NULL,
    description_pt TEXT,

    -- Challenge Type
    challenge_type TEXT NOT NULL CHECK (challenge_type IN (
        'quick_observation',   -- "Spot any bird in the next 24 hours"
        'specific_species',    -- "Find a butterfly"
        'location_based',      -- "Observe something in your neighborhood"
        'themed',              -- "Find something green"
        'bonus_exercise'       -- Complete a specific exercise
    )),

    -- Requirements (flexible based on type)
    requirements JSONB DEFAULT '{}',              -- {species: [], theme: "marine", etc.}

    -- Rewards (higher than normal!)
    points_reward INTEGER NOT NULL,               -- Base reward
    points_penalty INTEGER DEFAULT 0,             -- Points lost if not completed

    -- Time Limit
    duration_hours INTEGER DEFAULT 24,            -- How long user has to complete

    -- Scheduling
    frequency TEXT DEFAULT 'random' CHECK (frequency IN (
        'random',      -- System picks randomly
        'daily',       -- Once per day
        'weekly'       -- Once per week
    )),
    weight INTEGER DEFAULT 1,                     -- Higher = more likely to be selected

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Map Display
    map_region_code TEXT,                         -- Region to highlight on eco-map

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for random selection
CREATE INDEX IF NOT EXISTS idx_unpredictable_active ON unpredictable_challenges(is_active, weight);

-- =====================================================
-- 7. USER ACTIVE CHALLENGES (Currently assigned to user)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_active_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Can be either type of challenge
    ngo_challenge_id UUID REFERENCES ngo_challenges(id),
    unpredictable_challenge_id UUID REFERENCES unpredictable_challenges(id),

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN (
        'active',      -- In progress
        'completed',   -- Successfully completed
        'expired',     -- Time ran out
        'abandoned'    -- User gave up
    )),

    -- Progress
    progress_count INTEGER DEFAULT 0,             -- Observations submitted
    target_count INTEGER NOT NULL,                -- Goal

    -- Timing
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                       -- For time-limited challenges
    completed_at TIMESTAMPTZ,

    -- Points
    points_earned INTEGER DEFAULT 0,
    points_lost INTEGER DEFAULT 0,

    -- Notification
    notification_shown BOOLEAN DEFAULT false,     -- Has user seen the red dot?
    notification_clicked BOOLEAN DEFAULT false,   -- Has user clicked to view?

    -- Ensure one of the challenge types is set
    CHECK (
        (ngo_challenge_id IS NOT NULL AND unpredictable_challenge_id IS NULL) OR
        (ngo_challenge_id IS NULL AND unpredictable_challenge_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_active_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_notification ON user_active_challenges(user_id, notification_shown)
    WHERE status = 'active';

-- =====================================================
-- 8. USER OBSERVATIONS (Core wildlife/plant observations)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Challenge Association (optional)
    user_challenge_id UUID REFERENCES user_active_challenges(id),

    -- Location Data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name TEXT,                           -- "São Paulo, Brazil"
    region_code TEXT,                             -- "BR" for map integration

    -- Observation Content
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT NOT NULL,
    observation_date DATE DEFAULT CURRENT_DATE,

    -- AI Species Identification (OpenAI + iNaturalist)
    ai_species_name TEXT,                         -- Primary identification
    ai_scientific_name TEXT,                      -- Scientific name
    ai_confidence TEXT CHECK (ai_confidence IN ('high', 'medium', 'low')),
    ai_alternatives JSONB,                        -- Alternative suggestions from iNaturalist
    ai_educational_note TEXT,                     -- Fun fact / ecological importance
    ai_family TEXT,                               -- Taxonomic family
    ai_habitat TEXT,                              -- Natural habitat
    ai_conservation_status TEXT,                  -- IUCN status of identified species

    -- User Verification
    user_confirmed_species TEXT,                  -- If user corrects AI
    is_ai_correct BOOLEAN,                        -- User feedback on AI accuracy

    -- Visibility & Engagement
    visibility TEXT DEFAULT 'public' CHECK (visibility IN (
        'public',      -- Everyone can see
        'school',      -- Only school members
        'private'      -- Only the user
    )),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,

    -- Points
    points_earned INTEGER DEFAULT 0,

    -- School Association (for filtering)
    school_id UUID,                               -- If user belongs to a school

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_observations_user ON user_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_location ON user_observations(region_code);
CREATE INDEX IF NOT EXISTS idx_observations_species ON user_observations(ai_species_name);
CREATE INDEX IF NOT EXISTS idx_observations_public ON user_observations(visibility, created_at DESC)
    WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_observations_school ON user_observations(school_id, created_at DESC)
    WHERE school_id IS NOT NULL;

-- Spatial index for map queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_observations_geo ON user_observations
--     USING gist(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- =====================================================
-- 9. OBSERVATION LIKES (Social engagement)
-- =====================================================
CREATE TABLE IF NOT EXISTS observation_likes (
    observation_id UUID NOT NULL REFERENCES user_observations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (observation_id, user_id)
);

-- Index for counting likes
CREATE INDEX IF NOT EXISTS idx_likes_observation ON observation_likes(observation_id);

-- =====================================================
-- 10. OBSERVATION COMMENTS (Community discussion)
-- =====================================================
CREATE TABLE IF NOT EXISTS observation_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES user_observations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    comment TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching comments
CREATE INDEX IF NOT EXISTS idx_comments_observation ON observation_comments(observation_id, created_at);

-- =====================================================
-- 11. NARRATIVE MESSAGES (Dynamic story progression)
-- =====================================================
CREATE TABLE IF NOT EXISTS narrative_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Trigger Conditions
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'welcome',           -- First time user
        'status_change',     -- IUCN status changed
        'milestone',         -- Reached a milestone
        'inactivity',        -- User hasn't logged in
        'challenge_complete',-- Completed a challenge
        'observation_first', -- First observation
        'observation_count'  -- Reached X observations
    )),
    trigger_value TEXT,                           -- e.g., "EN" for status, "10" for count

    -- Message Content
    message TEXT NOT NULL,                        -- English with {species} placeholder
    message_pt TEXT,                              -- Portuguese version

    -- Visual
    icon TEXT,                                    -- Emoji or icon name
    animation TEXT,                               -- Animation type (celebrate, warn, etc.)

    -- Priority (higher = more important)
    priority INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for message lookup
CREATE INDEX IF NOT EXISTS idx_narrative_trigger ON narrative_messages(trigger_type, trigger_value, is_active);

-- =====================================================
-- 12. POINTS HISTORY (Audit trail of all point changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Point Change
    points_change INTEGER NOT NULL,               -- Positive or negative
    points_before INTEGER NOT NULL,
    points_after INTEGER NOT NULL,

    -- Source
    source_type TEXT NOT NULL CHECK (source_type IN (
        'observation',
        'ngo_challenge',
        'unpredictable_challenge',
        'exercise',
        'memory_game',
        'snake_game',
        'lesson_complete',
        'unit_complete',
        'penalty',
        'bonus',
        'admin_adjustment'
    )),
    source_id UUID,                               -- Reference to the source record

    -- Description
    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id, created_at DESC);

-- =====================================================
-- 13. INSERT DEFAULT NARRATIVE MESSAGES
-- =====================================================
INSERT INTO narrative_messages (trigger_type, trigger_value, message, message_pt, icon, priority) VALUES
    -- Welcome
    ('welcome', NULL, 'Welcome, young naturalist! Your {species} family is counting on you. You have 4 seasons to help them thrive. Explore our planet and complete challenges to secure their future!', 'Bem-vindo, jovem naturalista! Sua família de {species} está contando com você. Você tem 4 estações para ajudá-los a prosperar. Explore nosso planeta e complete desafios para garantir o futuro deles!', '🌱', 100),

    -- Status Changes (up)
    ('status_change', 'EN', 'Great news! The {species} population is stabilizing. They''ve moved from Critically Endangered to Endangered. Keep up the amazing work!', 'Ótimas notícias! A população de {species} está se estabilizando. Eles passaram de Criticamente Em Perigo para Em Perigo. Continue com o trabalho incrível!', '📈', 90),
    ('status_change', 'VU', 'Wonderful progress! The {species} are no longer Endangered - they''re now Vulnerable. Your dedication is making a real difference!', 'Progresso maravilhoso! Os {species} não estão mais Em Perigo - agora estão Vulneráveis. Sua dedicação está fazendo uma diferença real!', '🌟', 90),
    ('status_change', 'NT', 'Amazing achievement! The {species} population has recovered to Near Threatened status. They''re almost safe!', 'Conquista incrível! A população de {species} se recuperou para o status Quase Ameaçado. Eles estão quase seguros!', '🎉', 90),
    ('status_change', 'LC', 'CONGRATULATIONS! You''ve done it! The {species} are now of Least Concern - they''re thriving in the wild thanks to you!', 'PARABÉNS! Você conseguiu! Os {species} agora são de Menor Preocupação - eles estão prosperando na natureza graças a você!', '🏆', 100),

    -- Milestones
    ('observation_first', NULL, 'Your first observation! Every sighting helps scientists understand and protect wildlife. The {species} are proud of you!', 'Sua primeira observação! Cada avistamento ajuda cientistas a entender e proteger a vida selvagem. Os {species} estão orgulhosos de você!', '📸', 80),
    ('observation_count', '10', 'You''ve made 10 observations! You''re becoming a true naturalist. The {species} population is growing stronger!', 'Você fez 10 observações! Você está se tornando um verdadeiro naturalista. A população de {species} está ficando mais forte!', '🔟', 70),
    ('observation_count', '50', 'Incredible! 50 observations logged. You''re an expert wildlife spotter now!', 'Incrível! 50 observações registradas. Você agora é um especialista em avistar vida selvagem!', '⭐', 70),

    -- Challenge
    ('challenge_complete', NULL, 'Challenge completed! You''ve earned bonus points for your {species} family!', 'Desafio concluído! Você ganhou pontos bônus para sua família de {species}!', '✅', 60),

    -- Inactivity (gentle nudge)
    ('inactivity', '7', 'We miss you! Your {species} family has been waiting. Come back and continue your journey!', 'Sentimos sua falta! Sua família de {species} está esperando. Volte e continue sua jornada!', '💭', 50)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 14. INSERT DEFAULT UNPREDICTABLE CHALLENGES
-- =====================================================
INSERT INTO unpredictable_challenges (title, title_pt, description, description_pt, challenge_type, requirements, points_reward, points_penalty, duration_hours, weight) VALUES
    ('Quick Spotter', 'Observador Rápido', 'Spot and photograph any wild animal or plant in your area within 24 hours!', 'Aviste e fotografe qualquer animal ou planta selvagem em sua área em 24 horas!', 'quick_observation', '{"min_observations": 1}', 150, 50, 24, 3),

    ('Bird Watcher', 'Observador de Aves', 'Find and photograph a bird - any species counts!', 'Encontre e fotografe uma ave - qualquer espécie conta!', 'specific_species', '{"category": "bird"}', 200, 75, 24, 2),

    ('Insect Explorer', 'Explorador de Insetos', 'Discover an insect in your environment. Look closely - they''re everywhere!', 'Descubra um inseto em seu ambiente. Olhe com atenção - eles estão em toda parte!', 'specific_species', '{"category": "insect"}', 175, 50, 24, 2),

    ('Green Hunter', 'Caçador Verde', 'Find and photograph any plant with flowers or fruits!', 'Encontre e fotografe qualquer planta com flores ou frutos!', 'themed', '{"theme": "flowering_plant"}', 125, 25, 24, 3),

    ('Neighborhood Nature', 'Natureza do Bairro', 'Document wildlife right in your neighborhood - urban nature counts!', 'Documente a vida selvagem em seu bairro - natureza urbana conta!', 'location_based', '{"location_type": "urban"}', 150, 50, 24, 2),

    ('Double Discovery', 'Descoberta Dupla', 'Find TWO different species in the next 24 hours!', 'Encontre DUAS espécies diferentes nas próximas 24 horas!', 'quick_observation', '{"min_observations": 2, "unique_species": true}', 300, 100, 24, 1),

    ('Marine Life', 'Vida Marinha', 'If you''re near water, find any aquatic life - fish, crabs, seabirds count!', 'Se você estiver perto da água, encontre qualquer vida aquática - peixes, caranguejos, aves marinhas contam!', 'themed', '{"theme": "marine"}', 250, 75, 48, 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 15. INSERT DEFAULT SPECIES AVATARS
-- =====================================================
INSERT INTO species_avatars (common_name, common_name_pt, scientific_name, family, habitat, region_code, iucn_status, description, fun_fact, conservation_note) VALUES
    ('Northern Muriqui', 'Muriqui-do-norte', 'Brachyteles hypoxanthus', 'Atelidae', 'Atlantic Forest, Brazil', 'BR', 'CR',
     'The Northern Muriqui is the largest primate in the Americas. These gentle giants live in the treetops of Brazil''s Atlantic Forest.',
     'Muriquis are known as the "hippie monkeys" because they resolve conflicts with hugs instead of fights!',
     'Only about 1,000 individuals remain due to habitat loss from deforestation.'),

    ('Blue-throated Macaw', 'Arara-de-garganta-azul', 'Ara glaucogularis', 'Psittacidae', 'Beni Savanna, Bolivia', 'BO', 'CR',
     'One of the rarest macaws in the world, with striking blue and yellow plumage and a distinctive blue throat.',
     'Blue-throated Macaws mate for life and can live up to 50 years!',
     'Fewer than 500 remain in the wild due to habitat loss and the pet trade.'),

    ('Javan Rhino', 'Rinoceronte-de-java', 'Rhinoceros sondaicus', 'Rhinocerotidae', 'Ujung Kulon, Indonesia', 'ID', 'CR',
     'The rarest large mammal on Earth. These prehistoric-looking creatures have been on our planet for millions of years.',
     'Javan Rhinos are so shy that scientists rarely see them - most knowledge comes from camera traps!',
     'Fewer than 80 individuals survive, all in one national park in Indonesia.'),

    ('Vaquita', 'Vaquita', 'Phocoena sinus', 'Phocoenidae', 'Gulf of California, Mexico', 'MX', 'CR',
     'The world''s smallest and most endangered porpoise, with distinctive dark rings around its eyes.',
     'Vaquitas are called "pandas of the sea" because of their black eye patches!',
     'Fewer than 10 may remain, making them the most endangered marine mammal.'),

    ('Sumatran Orangutan', 'Orangotango-de-sumatra', 'Pongo abelii', 'Hominidae', 'Sumatra, Indonesia', 'ID', 'CR',
     'Our close relatives who share 97% of our DNA. They are the most arboreal of the great apes.',
     'Orangutans are the only great apes from Asia, and they build a new nest to sleep in every night!',
     'About 14,000 remain due to palm oil plantations destroying their forest home.'),

    ('Hawksbill Sea Turtle', 'Tartaruga-de-pente', 'Eretmochelys imbricata', 'Cheloniidae', 'Tropical Oceans Worldwide', 'BR', 'CR',
     'Beautiful sea turtles known for their colorful shells and crucial role in maintaining healthy coral reefs.',
     'Hawksbills can eat sponges that are toxic to most other animals!',
     'Critically endangered due to shell trade, habitat loss, and climate change affecting nesting beaches.'),

    ('Giant Panda', 'Panda-gigante', 'Ailuropoda melanoleuca', 'Ursidae', 'Mountain Forests, China', 'CN', 'VU',
     'The beloved black and white bear that has become a symbol of conservation worldwide.',
     'Pandas spend 12 hours a day eating bamboo - up to 38 kg daily!',
     'Conservation success story - population has grown to over 1,800 thanks to protection efforts.'),

    ('African Elephant', 'Elefante-africano', 'Loxodonta africana', 'Elephantidae', 'Sub-Saharan Africa', 'KE', 'EN',
     'The largest land animal on Earth, known for their intelligence, memory, and strong family bonds.',
     'Elephants can recognize themselves in mirrors - a sign of self-awareness shared by very few animals!',
     'Poaching for ivory and habitat loss threaten these magnificent creatures.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 16. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current IUCN status and journey info
CREATE OR REPLACE FUNCTION get_user_journey(p_user_id UUID)
RETURNS TABLE (
    species_name TEXT,
    species_name_pt TEXT,
    scientific_name TEXT,
    avatar_image_url TEXT,
    current_status TEXT,
    starting_status TEXT,
    total_points INTEGER,
    points_to_next INTEGER,
    level_progress INTEGER,
    observations_count INTEGER,
    challenges_completed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.common_name,
        sa.common_name_pt,
        sa.scientific_name,
        sa.avatar_image_url,
        usj.current_iucn_status,
        usj.starting_iucn_status,
        usj.total_points,
        usj.points_to_next_level,
        usj.level_progress,
        usj.observations_count,
        usj.challenges_completed
    FROM user_species_journey usj
    JOIN species_avatars sa ON sa.id = usj.species_avatar_id
    WHERE usj.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check for pending unpredictable challenges (red dot)
CREATE OR REPLACE FUNCTION has_pending_challenge_notification(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_active_challenges
        WHERE user_id = p_user_id
        AND status = 'active'
        AND notification_shown = false
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get active unpredictable challenges for user
CREATE OR REPLACE FUNCTION get_active_challenges(p_user_id UUID)
RETURNS TABLE (
    challenge_id UUID,
    title TEXT,
    title_pt TEXT,
    description TEXT,
    description_pt TEXT,
    challenge_type TEXT,
    progress_count INTEGER,
    target_count INTEGER,
    points_reward INTEGER,
    expires_at TIMESTAMPTZ,
    map_region_code TEXT,
    is_ngo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        uac.id,
        COALESCE(nc.title, uc.title),
        COALESCE(nc.title_pt, uc.title_pt),
        COALESCE(nc.description, uc.description),
        COALESCE(nc.description_pt, uc.description_pt),
        COALESCE(nc.challenge_type, uc.challenge_type),
        uac.progress_count,
        uac.target_count,
        COALESCE(nc.points_reward, uc.points_reward),
        uac.expires_at,
        COALESCE(nc.map_region_code, uc.map_region_code),
        (nc.id IS NOT NULL) as is_ngo
    FROM user_active_challenges uac
    LEFT JOIN ngo_challenges nc ON nc.id = uac.ngo_challenge_id
    LEFT JOIN unpredictable_challenges uc ON uc.id = uac.unpredictable_challenge_id
    WHERE uac.user_id = p_user_id
    AND uac.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 17. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on user-specific tables
ALTER TABLE user_species_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- User Species Journey: Users can only see/modify their own
CREATE POLICY user_journey_policy ON user_species_journey
    FOR ALL USING (auth.uid() = user_id);

-- Observations: Public ones visible to all, others only to owner
CREATE POLICY observations_select_policy ON user_observations
    FOR SELECT USING (
        visibility = 'public'
        OR user_id = auth.uid()
        OR (visibility = 'school' AND school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid()
        ))
    );

CREATE POLICY observations_modify_policy ON user_observations
    FOR ALL USING (user_id = auth.uid());

-- Likes: Anyone can like public observations
CREATE POLICY likes_policy ON observation_likes
    FOR ALL USING (user_id = auth.uid());

-- Comments: Anyone can comment on public observations
CREATE POLICY comments_select_policy ON observation_comments
    FOR SELECT USING (
        observation_id IN (
            SELECT id FROM user_observations WHERE visibility = 'public'
        )
        OR user_id = auth.uid()
    );

CREATE POLICY comments_insert_policy ON observation_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY comments_delete_policy ON observation_comments
    FOR DELETE USING (user_id = auth.uid());

-- Points History: Users can only see their own
CREATE POLICY points_history_policy ON points_history
    FOR SELECT USING (user_id = auth.uid());

-- Challenges: Users can only see/modify their own active challenges
CREATE POLICY challenges_policy ON user_active_challenges
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this SQL in Supabase SQL Editor
-- After running, create the 'observations' storage bucket via Dashboard
-- =====================================================
