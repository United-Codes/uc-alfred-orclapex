SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL views.json

select apex_view_name as "name"
     , comments as "description"
     , parent_view as "parentView"
   from apex_dictionary
  where column_id = 0
  order by apex_view_name;
-- NOTE: APEX_MAIL_LOG / APEX_MAIL_QUEUE used to be missing from
-- apex_dictionary and were unioned in manually. Since APEX 26.1 they
-- are native dictionary views, so no workaround is needed.

SPOOL OFF
