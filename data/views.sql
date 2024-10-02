SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL views.json

select apex_view_name as "name"
     , comments as "description"
     , parent_view as "parentView"
  from apex_dictionary
 where column_id = 0;

SPOOL OFF
