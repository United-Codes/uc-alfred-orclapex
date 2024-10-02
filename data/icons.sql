SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL icons.json

select icon_name as "name"
     , icon_filters as "search"
     , icon_category as "category"
  from APEX_DG_BUILTIN_FONTAPEX;

SPOOL OFF
