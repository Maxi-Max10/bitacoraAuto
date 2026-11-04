CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'car' CHECK (type IN ('car','motorcycle','pickup','suv','van','truck','bus','motorhome','boat','bicycle','other')),
  make varchar(60) NOT NULL,
  model varchar(80) NOT NULL,
  year smallint CHECK (year BETWEEN 1900 AND 2100),
  plate varchar(20) NOT NULL DEFAULT '',
  km integer NOT NULL DEFAULT 0 CHECK (km BETWEEN 0 AND 99999999),
  body varchar(20) NOT NULL DEFAULT 'auto',
  revision integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id,user_id)
);
CREATE INDEX IF NOT EXISTS vehicles_owner_idx ON vehicles(user_id,created_at);
CREATE TABLE IF NOT EXISTS maintenance_entries (
  id uuid PRIMARY KEY,
  vehicle_id uuid NOT NULL,
  user_id text NOT NULL,
  title varchar(160) NOT NULL,
  category varchar(20) NOT NULL CHECK (category IN ('mantenimiento','reparacion','mejora','revision','otro')),
  date date NOT NULL,
  time varchar(5) NOT NULL,
  km integer NOT NULL CHECK (km BETWEEN 0 AND 99999999),
  cost numeric(14,2) CHECK (cost >= 0),
  workshop varchar(160) NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '' CHECK (length(notes)<=10000),
  FOREIGN KEY (vehicle_id,user_id) REFERENCES vehicles(id,user_id) ON DELETE CASCADE,
  UNIQUE (id,vehicle_id,user_id)
);
CREATE INDEX IF NOT EXISTS entries_vehicle_idx ON maintenance_entries(user_id,vehicle_id,date);
CREATE TABLE IF NOT EXISTS vehicle_files (
  id uuid PRIMARY KEY,
  vehicle_id uuid NOT NULL,
  user_id text NOT NULL,
  entry_id uuid,
  name varchar(255) NOT NULL,
  mime varchar(160) NOT NULL,
  size integer NOT NULL CHECK (size BETWEEN 0 AND 15728640),
  pathname text NOT NULL UNIQUE,
  uploaded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (vehicle_id,user_id) REFERENCES vehicles(id,user_id) ON DELETE CASCADE,
  FOREIGN KEY (entry_id,vehicle_id,user_id) REFERENCES maintenance_entries(id,vehicle_id,user_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS files_owner_idx ON vehicle_files(user_id,vehicle_id,entry_id);
CREATE TABLE IF NOT EXISTS file_garbage(pathname text PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now());
