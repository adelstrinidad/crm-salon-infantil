-- dependency_matrix.sql
-- Purpose: Generate a cross-schema and intra-schema dependency matrix for packages, procedures, functions, views.
-- Usage (as privileged user with access to DBA_* or substitute ALL_* for restricted scope).
-- Parameters: Optionally edit the IN clauses to restrict schemas of interest.

SET PAGESIZE 50000
SET LINESIZE 250
COLUMN source_owner FORMAT A18
COLUMN source_name FORMAT A40
COLUMN referenced_owner FORMAT A18
COLUMN referenced_name FORMAT A40

-- 1. Raw dependency edges (filtered to APPLICATION schemas)
WITH src AS (
  SELECT /*+ MATERIALIZE */ DISTINCT owner
  FROM dba_objects
  WHERE owner IN (
    'VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB'
  )
)
SELECT d.owner       AS source_owner,
       d.name        AS source_name,
       d.type        AS source_type,
       d.referenced_owner,
       d.referenced_name,
       d.referenced_type
FROM   dba_dependencies d
JOIN   src s ON s.owner = d.owner
WHERE  d.referenced_owner IN (SELECT owner FROM src)
AND    d.owner            <> d.referenced_owner
AND    d.type IN ('PACKAGE','PACKAGE BODY','FUNCTION','PROCEDURE','VIEW')
AND    d.referenced_type IN ('PACKAGE','PACKAGE BODY','FUNCTION','PROCEDURE','VIEW')
ORDER BY d.owner, d.name;

-- 2. Cross-schema dependency aggregation (matrix)
PROMPT \n== Cross-Schema Dependency Counts ==
COL from_schema FORMAT A15
COL to_schema   FORMAT A15
SELECT owner AS from_schema,
       referenced_owner AS to_schema,
       COUNT(*) AS edge_count
FROM   dba_dependencies
WHERE  owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    referenced_owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    owner <> referenced_owner
GROUP BY owner, referenced_owner
ORDER BY owner, referenced_owner;

-- 3. High fan-out objects (potential refactor candidates)
PROMPT \n== High Fan-Out Objects (Objects referencing many distinct targets) ==
SELECT owner, name, type, COUNT(DISTINCT referenced_name) AS distinct_refs
FROM   dba_dependencies
WHERE  owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    referenced_owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
GROUP  BY owner, name, type
HAVING COUNT(DISTINCT referenced_name) >= 10
ORDER  BY distinct_refs DESC FETCH FIRST 50 ROWS ONLY;

-- 4. High fan-in objects (heavily referenced targets)
PROMPT \n== High Fan-In Objects (Heavily referenced) ==
SELECT referenced_owner AS owner,
       referenced_name  AS name,
       referenced_type  AS type,
       COUNT(DISTINCT owner || ':' || name) AS distinct_callers
FROM   dba_dependencies
WHERE  owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    referenced_owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
GROUP BY referenced_owner, referenced_name, referenced_type
HAVING COUNT(DISTINCT owner || ':' || name) >= 10
ORDER  BY distinct_callers DESC FETCH FIRST 50 ROWS ONLY;

-- 5. Cross-schema DML usage (procedures referencing tables in another schema)
PROMPT \n== Cross-Schema Table References (Potential Coupling Hotspots) ==
COL referencing_obj FORMAT A55
SELECT DISTINCT d.owner || '.' || d.name AS referencing_obj,
       t.owner  AS target_table_owner,
       t.table_name
FROM   dba_dependencies d
JOIN   dba_objects t
       ON t.owner = d.referenced_owner
      AND t.object_name = d.referenced_name
WHERE  d.owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    t.owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
AND    t.object_type = 'TABLE'
AND    d.owner <> t.owner
ORDER BY referencing_obj, target_table_owner;

-- 6. Summary pivot (optional manual pivoting in spreadsheet)
-- Export section above and pivot externally for visualization.

PROMPT \nFinished dependency matrix extraction.
