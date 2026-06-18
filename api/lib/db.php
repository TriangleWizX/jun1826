<?php
declare(strict_types=1);

function ss_db_path(): string
{
    $fromEnv = getenv('DB_PATH');
    if (is_string($fromEnv) && $fromEnv !== '') {
        return $fromEnv;
    }
    return dirname(__DIR__, 2) . '/data/senseisandy.sqlite';
}

function ss_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $path = ss_db_path();
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA synchronous = NORMAL');
    $pdo->exec('PRAGMA foreign_keys = ON');

    ss_run_migrations($pdo);

    return $pdo;
}

function ss_run_migrations(PDO $db): void
{
    $db->exec(
        'CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            name TEXT NOT NULL,
            contact_method TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            interest_lane TEXT,
            message TEXT,
            source_url TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            utm_content TEXT,
            utm_term TEXT,
            ip_hash TEXT,
            user_agent TEXT
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            provider TEXT NOT NULL,
            provider_event_id TEXT NOT NULL,
            name TEXT,
            email TEXT,
            phone TEXT,
            lane TEXT,
            start_time TEXT,
            source_url TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            utm_content TEXT,
            utm_term TEXT,
            UNIQUE(provider, provider_event_id)
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS review_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            fetched_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS event_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            ip_hash TEXT,
            user_agent TEXT
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS rate_limits (
            bucket_key TEXT PRIMARY KEY,
            window_start INTEGER NOT NULL,
            hit_count INTEGER NOT NULL DEFAULT 0
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS location (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            address1 TEXT,
            city TEXT,
            state TEXT,
            postal_code TEXT,
            timezone TEXT NOT NULL DEFAULT \'America/New_York\',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS person (
            id TEXT PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            birthdate TEXT,
            is_minor INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT \'lead\',
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );
    $db->exec('CREATE UNIQUE INDEX IF NOT EXISTS ux_person_email ON person(email)');
    $db->exec('CREATE INDEX IF NOT EXISTS ix_person_phone ON person(phone)');
    $db->exec('CREATE INDEX IF NOT EXISTS ix_person_status ON person(status)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS household (
            id TEXT PRIMARY KEY,
            name TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS household_member (
            household_id TEXT NOT NULL,
            person_id TEXT NOT NULL,
            role TEXT NOT NULL,
            is_primary INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            PRIMARY KEY (household_id, person_id),
            FOREIGN KEY (household_id) REFERENCES household(id),
            FOREIGN KEY (person_id) REFERENCES person(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_household_member_role ON household_member(role)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS program (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS plan (
            id TEXT PRIMARY KEY,
            program_id TEXT NOT NULL,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            price_cents INTEGER NOT NULL,
            billing_type TEXT NOT NULL,
            period TEXT,
            period_count INTEGER,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (program_id, code),
            FOREIGN KEY (program_id) REFERENCES program(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_plan_active ON plan(is_active)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS enrollment (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            program_id TEXT NOT NULL,
            plan_id TEXT,
            status TEXT NOT NULL DEFAULT \'active\',
            start_date TEXT NOT NULL,
            end_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (person_id) REFERENCES person(id),
            FOREIGN KEY (program_id) REFERENCES program(id),
            FOREIGN KEY (plan_id) REFERENCES plan(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_enrollment_person ON enrollment(person_id, status)');
    $db->exec('CREATE INDEX IF NOT EXISTS ix_enrollment_program ON enrollment(program_id, status)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS booking (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            program_id TEXT,
            booking_type TEXT NOT NULL DEFAULT \'intro\',
            start_at TEXT NOT NULL,
            end_at TEXT,
            status TEXT NOT NULL DEFAULT \'booked\',
            source TEXT NOT NULL,
            external_id TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            referrer TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (source, external_id),
            FOREIGN KEY (person_id) REFERENCES person(id),
            FOREIGN KEY (program_id) REFERENCES program(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_booking_person ON booking(person_id, start_at)');
    $db->exec('CREATE INDEX IF NOT EXISTS ix_booking_status ON booking(status, start_at)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS session (
            id TEXT PRIMARY KEY,
            location_id TEXT NOT NULL,
            program_id TEXT NOT NULL,
            title TEXT,
            start_at TEXT NOT NULL,
            end_at TEXT NOT NULL,
            capacity INTEGER,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (location_id) REFERENCES location(id),
            FOREIGN KEY (program_id) REFERENCES program(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_session_start ON session(start_at)');
    $db->exec('CREATE INDEX IF NOT EXISTS ix_session_program ON session(program_id, start_at)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS attendance (
            session_id TEXT NOT NULL,
            person_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT \'present\',
            checked_in_at TEXT,
            created_at TEXT NOT NULL,
            PRIMARY KEY (session_id, person_id),
            FOREIGN KEY (session_id) REFERENCES session(id),
            FOREIGN KEY (person_id) REFERENCES person(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_attendance_person ON attendance(person_id, created_at)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS waiver (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            guardian_id TEXT,
            signed_at TEXT NOT NULL,
            waiver_version TEXT NOT NULL,
            storage_uri TEXT NOT NULL,
            file_sha256 TEXT NOT NULL,
            ip_address TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (person_id) REFERENCES person(id),
            FOREIGN KEY (guardian_id) REFERENCES person(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_waiver_person ON waiver(person_id, signed_at)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS referral_source (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            code TEXT UNIQUE,
            created_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS referral_attribution (
            id TEXT PRIMARY KEY,
            person_id TEXT NOT NULL,
            referral_source_id TEXT NOT NULL,
            attributed_at TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (person_id) REFERENCES person(id),
            FOREIGN KEY (referral_source_id) REFERENCES referral_source(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_ref_attr_person ON referral_attribution(person_id, attributed_at)');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS user_account (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL DEFAULT \'owner\',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            actor_user_id TEXT,
            action TEXT NOT NULL,
            entity TEXT NOT NULL,
            entity_id TEXT,
            meta_json TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (actor_user_id) REFERENCES user_account(id)
        )'
    );
    $db->exec('CREATE INDEX IF NOT EXISTS ix_audit_entity ON audit_log(entity, entity_id, created_at)');

    $db->exec(
        'INSERT OR IGNORE INTO program (id, code, name, description, created_at, updated_at) VALUES
            (\'00000000-0000-0000-0000-000000000001\', \'kids\', \'Kids BJJ\', \'Ages ~5-12\', datetime(\'now\'), datetime(\'now\')),
            (\'00000000-0000-0000-0000-000000000002\', \'teens\', \'Teens BJJ\', \'Ages ~13-16\', datetime(\'now\'), datetime(\'now\')),
            (\'00000000-0000-0000-0000-000000000003\', \'adults\', \'Adults BJJ\', \'Beginner-friendly\', datetime(\'now\'), datetime(\'now\')),
            (\'00000000-0000-0000-0000-000000000004\', \'privates\', \'Private Coaching\', \'1-on-1 sessions\', datetime(\'now\'), datetime(\'now\'))'
    );

    $db->exec(
        'INSERT OR IGNORE INTO location (id, name, timezone, created_at, updated_at) VALUES
            (\'00000000-0000-0000-0000-000000000010\', \'Main Studio\', \'America/New_York\', datetime(\'now\'), datetime(\'now\'))'
    );
}

function ss_program_id_for_lane(string $lane): ?string
{
    static $programIdByLane = [
        'kids' => '00000000-0000-0000-0000-000000000001',
        'teens' => '00000000-0000-0000-0000-000000000002',
        'adults' => '00000000-0000-0000-0000-000000000003',
        'private' => '00000000-0000-0000-0000-000000000004',
        'privates' => '00000000-0000-0000-0000-000000000004',
    ];

    return $programIdByLane[$lane] ?? null;
}

/**
 * @return array{0:string,1:string}
 */
function ss_split_name(string $fullName): array
{
    $parts = preg_split('/\s+/', trim($fullName)) ?: [];
    $firstName = $parts[0] ?? $fullName;
    $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
    return [$firstName, $lastName];
}

function ss_find_person_id(PDO $db, string $email, string $phone): ?string
{
    if ($email !== '') {
        $personLookup = $db->prepare('SELECT id FROM person WHERE email = :email LIMIT 1');
        $personLookup->execute([':email' => $email]);
        $row = $personLookup->fetch(PDO::FETCH_ASSOC);
        if ($row !== false) {
            return (string)$row['id'];
        }
    }

    if ($phone !== '') {
        $personLookup = $db->prepare('SELECT id FROM person WHERE phone = :phone ORDER BY updated_at DESC LIMIT 1');
        $personLookup->execute([':phone' => $phone]);
        $row = $personLookup->fetch(PDO::FETCH_ASSOC);
        if ($row !== false) {
            return (string)$row['id'];
        }
    }

    return null;
}

function ss_upsert_person_from_lead(
    PDO $db,
    string $name,
    string $email,
    string $phone,
    bool $updateOnMatch = true
): string {
    $personId = ss_find_person_id($db, $email, $phone);
    [$firstName, $lastName] = ss_split_name($name);
    $now = ss_now_iso();

    if ($personId === null) {
        $personId = ss_uuid_v4();
        $insertPerson = $db->prepare(
            'INSERT INTO person (id, first_name, last_name, email, phone, status, created_at, updated_at)
             VALUES (:id, :first_name, :last_name, :email, :phone, :status, :created_at, :updated_at)'
        );
        $insertPerson->execute([
            ':id' => $personId,
            ':first_name' => $firstName !== '' ? $firstName : null,
            ':last_name' => $lastName !== '' ? $lastName : null,
            ':email' => $email !== '' ? $email : null,
            ':phone' => $phone !== '' ? $phone : null,
            ':status' => 'lead',
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
        return $personId;
    }

    if ($updateOnMatch) {
        $updatePerson = $db->prepare(
            'UPDATE person
             SET first_name = COALESCE(NULLIF(:first_name, \'\'), first_name),
                 last_name = COALESCE(NULLIF(:last_name, \'\'), last_name),
                 email = COALESCE(NULLIF(:email, \'\'), email),
                 phone = COALESCE(NULLIF(:phone, \'\'), phone),
                 updated_at = :updated_at
             WHERE id = :id'
        );
        $updatePerson->execute([
            ':id' => $personId,
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':phone' => $phone,
            ':updated_at' => $now,
        ]);
    }

    return $personId;
}

function ss_create_intro_booking(
    PDO $db,
    string $personId,
    ?string $programId,
    string $startAt,
    ?string $endAt,
    string $source,
    ?string $externalId,
    ?string $utmSource = null,
    ?string $utmMedium = null,
    ?string $utmCampaign = null,
    ?string $referrer = null
): ?string {
    $bookingId = ss_uuid_v4();
    $now = ss_now_iso();
    $insertBooking = $db->prepare(
        'INSERT OR IGNORE INTO booking (
            id, person_id, program_id, booking_type, start_at, end_at, status, source, external_id,
            utm_source, utm_medium, utm_campaign, referrer, created_at, updated_at
         ) VALUES (
            :id, :person_id, :program_id, :booking_type, :start_at, :end_at, :status, :source, :external_id,
            :utm_source, :utm_medium, :utm_campaign, :referrer, :created_at, :updated_at
         )'
    );
    $insertBooking->execute([
        ':id' => $bookingId,
        ':person_id' => $personId,
        ':program_id' => $programId,
        ':booking_type' => 'intro',
        ':start_at' => $startAt,
        ':end_at' => $endAt,
        ':status' => 'booked',
        ':source' => $source,
        ':external_id' => $externalId,
        ':utm_source' => $utmSource,
        ':utm_medium' => $utmMedium,
        ':utm_campaign' => $utmCampaign,
        ':referrer' => $referrer,
        ':created_at' => $now,
        ':updated_at' => $now,
    ]);

    if ($insertBooking->rowCount() === 0) {
        return null;
    }

    return $bookingId;
}
