-- feature_usage_scan.sql
-- Purpose: Identify Oracle-specific features that may complicate migration to PostgreSQL or service extraction.
-- Run as a user with access to DBA/ALL views (adjust DBA_ -> ALL_ if needed).
-- NOTE: This is pattern-based and should be complemented by AWS SCT report.

SET PAGESIZE 50000
SET LINESIZE 220
COLUMN owner FORMAT A15
COLUMN object_name FORMAT A40
COLUMN feature_detected FORMAT A35

WITH code AS (
  SELECT owner,
         name AS object_name,
         type AS object_type,
         TO_CLOB(text) AS src
  FROM   dba_source
  WHERE  owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
), flagged AS (
  SELECT owner,
         object_name,
         'Autonomous Transaction' AS feature_detected
  FROM   code
  WHERE  REGEXP_LIKE(src, 'PRAGMA\s+AUTONOMOUS_TRANSACTION','i')
  UNION ALL
  SELECT owner, object_name, 'DBMS_SCHEDULER' FROM code WHERE REGEXP_LIKE(src, 'DBMS_SCHEDULER','i')
  UNION ALL
  SELECT owner, object_name, 'DBMS_AQ' FROM code WHERE REGEXP_LIKE(src, 'DBMS_AQ','i')
  UNION ALL
  SELECT owner, object_name, 'PIPES (DBMS_PIPE)' FROM code WHERE REGEXP_LIKE(src, 'DBMS_PIPE','i')
  UNION ALL
  SELECT owner, object_name, 'Advanced Queuing (AQ enqueue/dequeue)' FROM code WHERE REGEXP_LIKE(src, 'DBMS_AQADM|DBMS_AQ.ENQUEUE|DBMS_AQ.DEQUEUE','i')
  UNION ALL
  SELECT owner, object_name, 'Hierarchical Query CONNECT BY' FROM code WHERE REGEXP_LIKE(src, 'CONNECT\s+BY','i')
  UNION ALL
  SELECT owner, object_name, 'Model Clause' FROM code WHERE REGEXP_LIKE(src, 'MODEL\s+\(','i')
  UNION ALL
  SELECT owner, object_name, 'Analytic Functions (RANK/DENSE_RANK/LAG/LEAD)' FROM code WHERE REGEXP_LIKE(src, '(DENSE_)?RANK\s*\(|LAG\s*\(|LEAD\s*\(','i')
  UNION ALL
  SELECT owner, object_name, 'Result Cache Hint' FROM code WHERE REGEXP_LIKE(src, 'RESULT_CACHE','i')
  UNION ALL
  SELECT owner, object_name, 'Global Temporary Table Usage' FROM dba_dependencies d
        WHERE d.type IN ('PROCEDURE','FUNCTION','PACKAGE','PACKAGE BODY')
          AND d.referenced_type = 'TABLE'
          AND d.referenced_owner IN ('VILMADB','CASDB','TSDB','COLLECTORDB','MESSAGINGDB')
          AND EXISTS (
            SELECT 1 FROM dba_tables t WHERE t.owner = d.referenced_owner AND t.table_name = d.referenced_name AND t.temporary = 'Y'
          )
  UNION ALL
  SELECT owner, object_name, 'Bulk Operations (FORALL/BULK COLLECT)' FROM code WHERE REGEXP_LIKE(src, 'BULK\s+COLLECT|FORALL','i')
  UNION ALL
  SELECT owner, object_name, 'Dynamic SQL (EXECUTE IMMEDIATE)' FROM code WHERE REGEXP_LIKE(src, 'EXECUTE\s+IMMEDIATE','i')
  UNION ALL
  SELECT owner, object_name, 'DBMS_JOB' FROM code WHERE REGEXP_LIKE(src, 'DBMS_JOB','i')
  UNION ALL
  SELECT owner, object_name, 'Flashback Query (AS OF TIMESTAMP|SCN)' FROM code WHERE REGEXP_LIKE(src, 'AS\s+OF\s+(TIMESTAMP|SCN)','i')
)
SELECT owner, object_name, feature_detected
FROM   flagged
ORDER BY owner, object_name, feature_detected;

PROMPT \n== Feature Usage Summary ==
SELECT feature_detected, COUNT(DISTINCT owner || '.' || object_name) AS object_count
FROM   flagged
GROUP BY feature_detected
ORDER BY object_count DESC;

PROMPT \nFinished feature usage scan.
