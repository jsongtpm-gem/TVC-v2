-- PDF documents (annual reports, bylaws) shown on the About page and
-- managed via AboutEditor.tsx's PdfManager. Columns match actual code usage:
-- section ('annual_report' | 'bylaw'), name, url, uploaded_at (used for ordering).

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL,
  name TEXT,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON documents FOR SELECT USING (true);
CREATE POLICY "admin_write" ON documents FOR ALL USING (auth.uid() IS NOT NULL);
