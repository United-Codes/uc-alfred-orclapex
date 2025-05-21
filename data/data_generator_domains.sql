SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL data_generator_domains.json

select friendly_name as "name"
     , builtin_category as "category"
     , native_datatype as "datatype"
  from APEX_DG_BUILTINS;

SPOOL OFF
