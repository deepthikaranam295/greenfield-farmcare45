"""Seed three demo field reports (irrigation, fertilization, pest inspection)

Revision ID: 011
Revises: 010
Create Date: 2026-06-22

Idempotent: skips seeding if field_reports already contains >= 3 rows.
"""
from alembic import op
from sqlalchemy import text

revision = "011"
down_revision = "010"
branch_labels = None
depends_on = None

NL = chr(10)

WORK_IRRIGATION = NL.join([
    "Inspected all irrigation lines and inlet pipes",
    "Cleared blockages and opened water flow to all sections",
    "Verified water coverage across the entire paddy field",
    "Checked outlet channels and confirmed drainage is functioning",
])

OBS_IRRIGATION = NL.join([
    "Crop growth is healthy and on schedule for this stage",
    "Soil moisture is adequate and uniform throughout the field",
    "No signs of pest infestation observed",
    "Water retention is satisfactory – no seepage detected",
])

REC_IRRIGATION = NL.join([
    "Schedule next irrigation after 5 days",
    "Monitor inlet water level daily",
    "Consider organic mulching near bunds to reduce evaporation",
])

WORK_FERTILIZER = NL.join([
    "Tested soil pH before application – reading 6.2",
    "Applied NPK 20-20-0 fertilizer as per recommended schedule",
    "Fertilizer spread uniformly across all sections using broadcast method",
    "Light irrigation carried out post-application to aid absorption",
])

OBS_FERTILIZER = NL.join([
    "Soil pH is slightly acidic (6.2) – within acceptable range",
    "Previous fertilizer application shows visible crop response",
    "No nutrient deficiency symptoms observed",
    "Weed growth is minimal near fertilized zones",
])

REC_FERTILIZER = NL.join([
    "Next fertilizer dose (urea top-dressing) in 3 weeks",
    "Add agricultural lime if pH drops below 6.0",
    "Avoid over-watering for 48 hours after application",
])

WORK_PEST = NL.join([
    "Conducted full field inspection for pest and disease activity",
    "Identified brown plant hopper infestation in sections B and C",
    "Applied targeted pesticide (Imidacloprid 17.8 SL) to affected zones",
    "Installed sticky traps at 5-metre intervals for ongoing monitoring",
])

OBS_PEST = NL.join([
    "Brown plant hopper detected in sections B and C (~15% coverage)",
    "No blast disease or sheath blight observed",
    "Leaf color is normal in unaffected areas",
    "Beneficial insects (spiders, ladybirds) present in section A",
])

REC_PEST = NL.join([
    "Follow-up inspection required in 7 days",
    "Do not apply additional pesticide without re-inspection",
    "Consider biological control agents for long-term management",
    "Notify agronomist if infestation spreads beyond 25% coverage",
])

SEED_SQL = """
DO $$
DECLARE
    v_farm_id  UUID;
    v_field1   UUID;
    v_field2   UUID;
    v_rep1     UUID := uuid_generate_v4();
    v_rep2     UUID := uuid_generate_v4();
    v_rep3     UUID := uuid_generate_v4();
    v_count    INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM field_reports WHERE is_deleted = false;
    IF v_count >= 3 THEN RETURN; END IF;

    SELECT id INTO v_farm_id FROM farms
    WHERE is_deleted = false ORDER BY created_at LIMIT 1;
    IF v_farm_id IS NULL THEN RETURN; END IF;

    -- Prefer user named Bhaskar, else first field_team user
    SELECT id INTO v_field1 FROM users
    WHERE role = 'field_team' AND is_active = true AND is_deleted = false
    ORDER BY (LOWER(name) LIKE '%bhaskar%') DESC, created_at LIMIT 1;

    -- Prefer user named Ravi as second; must differ from first
    SELECT id INTO v_field2 FROM users
    WHERE role = 'field_team' AND is_active = true AND is_deleted = false
      AND id IS DISTINCT FROM v_field1
    ORDER BY (LOWER(name) LIKE '%ravi%') DESC, created_at LIMIT 1;

    IF v_field1 IS NULL THEN RETURN; END IF;
    IF v_field2 IS NULL THEN v_field2 := v_field1; END IF;

    INSERT INTO field_reports
        (id, farm_id, submitted_by, visit_date, arrival_time, departure_time,
         work_done, observations, recommendations,
         status, issues_found, next_visit_needed, is_deleted, created_at, updated_at)
    VALUES
    (v_rep1, v_farm_id, v_field1, '2026-06-22', '09:00', '14:00',
     :work_irr, :obs_irr, :rec_irr,
     'completed', NULL, false, false, NOW(), NOW()),

    (v_rep2, v_farm_id, v_field2, '2026-06-18', '08:30', '13:00',
     :work_fert, :obs_fert, :rec_fert,
     'completed', NULL, false, false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

    (v_rep3, v_farm_id, v_field1, '2026-06-12', '10:00', '15:30',
     :work_pest, :obs_pest, :rec_pest,
     'follow_up_required', 'Brown plant hopper in sections B and C',
     true, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

    INSERT INTO report_photos (id, report_id, s3_url, caption, is_deleted, created_at)
    VALUES
    (uuid_generate_v4(), v_rep1, 'https://picsum.photos/seed/gf-irr-before/800/600', 'Before – Dry irrigation channels', false, NOW()),
    (uuid_generate_v4(), v_rep1, 'https://picsum.photos/seed/gf-irr-after/800/600',  'After – Water flowing through channels', false, NOW()),
    (uuid_generate_v4(), v_rep2, 'https://picsum.photos/seed/gf-fert-before/800/600','Before – Unfertilized soil', false, NOW()),
    (uuid_generate_v4(), v_rep2, 'https://picsum.photos/seed/gf-fert-after/800/600', 'After – Fertilizer broadcast applied', false, NOW()),
    (uuid_generate_v4(), v_rep3, 'https://picsum.photos/seed/gf-pest-inspect/800/600','Pest inspection – Section B infestation', false, NOW()),
    (uuid_generate_v4(), v_rep3, 'https://picsum.photos/seed/gf-pest-trap/800/600',   'Sticky trap installed for monitoring', false, NOW());

    -- Advance sequence past the 3 seeded rows
    PERFORM setval('field_reports_report_number_seq', 3);
END $$;
"""


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(SEED_SQL),
        {
            "work_irr":  WORK_IRRIGATION,
            "obs_irr":   OBS_IRRIGATION,
            "rec_irr":   REC_IRRIGATION,
            "work_fert": WORK_FERTILIZER,
            "obs_fert":  OBS_FERTILIZER,
            "rec_fert":  REC_FERTILIZER,
            "work_pest": WORK_PEST,
            "obs_pest":  OBS_PEST,
            "rec_pest":  REC_PEST,
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(text("""
        DELETE FROM report_photos
        WHERE report_id IN (
            SELECT id FROM field_reports WHERE report_number IN (1,2,3)
        )
    """))
    conn.execute(text("DELETE FROM field_reports WHERE report_number IN (1,2,3)"))
    conn.execute(text("SELECT setval('field_reports_report_number_seq', 0)"))
