-- Seed data. Every sample row is labelled "sample" in its title/label so it is
-- obvious to the admin that it is placeholder content to replace.

insert into public.form_definitions (type, label, is_private, notify) values
  ('enrolment','Enrolment application', true, true),
  ('waitlist','Waitlist entry', true, true),
  ('prayer','Prayer request', true, true),
  ('testimony','Testimony', false, true),
  ('contact','Contact message', false, true),
  ('registration','Event registration', false, true),
  ('booking','Call booking', true, true),
  ('newsletter','Newsletter signup', false, false),
  ('beta_feedback','Beta tester feedback', true, true)
on conflict (type) do nothing;

-- One sample beta review so the dashboard, inbox and stories tab can be
-- reviewed before real responses arrive. It is labelled "[sample]" and the
-- /admin/beta page removes every sample in one click.
insert into public.submissions (type, status, private, payload)
select
  'beta_feedback',
  'new',
  true,
  jsonb_build_object(
    'name', '[sample] Ada',
    'email', 'sample@example.com',
    'whatsapp', '',
    'location', 'Lagos, Nigeria',
    'device', 'Phone',
    'overall_rating', 4,
    'area_ratings', jsonb_build_object('design', 5, 'ease', 4, 'speed', 4, 'content', 5, 'mobile', 4),
    'liked', 'The teachings are easy to find and the pages feel calm.',
    'take', 'This is sample feedback used to preview the admin dashboard. The site reads like a letter rather than a brochure, and I could find the gatherings without hunting.',
    'issues', jsonb_build_array(
      jsonb_build_object('page', 'Teachings', 'description', 'Sample issue: the filter labels were small on my phone.', 'severity', 'Small annoyance', 'screenshots', jsonb_build_array())
    ),
    'improve', 'Sample answer: make the teaching filters a little easier to tap.',
    'wish', 'Sample answer: a way to save a teaching for later.',
    'story', 'Sample story: the weekly Bible study helped me read Scripture in order for the first time.',
    'story_consent', 'public_anonymous',
    'display_name', '',
    'may_contact', true,
    'wants_call', false,
    'meta', jsonb_build_object('browser', 'Chrome', 'os', 'Android', 'screen', '390×844', 'referrer', '', 'timestamp', now()),
    'isSample', true,
    'sample_label', 'sample'
  )
where not exists (
  select 1 from public.submissions where payload->>'isSample' = 'true'
);

insert into public.tags (name) values
  ('faith'), ('word-of-knowledge'), ('kingdom'), ('prayer'), ('prophecy')
on conflict do nothing;

insert into public.series (title, slug, description, status, sort_order, featured) values
  ('Faith Series [sample]','faith-series','Foundations of Bible faith: how it comes, how it grows, how it works.','published',1,true),
  ('Word of Knowledge [sample]','word-of-knowledge','The manifestation of the Spirit by which facts about people and situations are revealed.','published',2,false),
  ('The Mystery of the Kingdom [sample]','mystery-of-the-kingdom','The hidden order of the Kingdom of God, opened line by line.','draft',3,false)
on conflict do nothing;

insert into public.teachings (title, slug, series_id, part_number, date_taught, summary, body, tags, status, publish_at, featured) values
  ('Faith that moves mountains [sample]','faith-that-moves-mountains',
   (select id from public.series where slug='faith-series'), 1, current_date - 30,
   'The kind of faith that removes obstacles is not a feeling; it is planted by hearing and exercised by obedience.',
   '<p>This is <strong>sample content</strong>. Replace it from the admin dashboard.</p><h2>Hearing produces faith</h2><p>Faith comes by hearing, and hearing by the word of God (Romans 10:17). The word you receive becomes the substance of what you carry.</p><blockquote>So then faith cometh by hearing, and hearing by the word of God. — Romans 10:17</blockquote>',
   '{faith}', 'published', now() - interval '30 days', true),
  ('The spirit of wisdom and revelation [sample]','spirit-of-wisdom-revelation',
   (select id from public.series where slug='faith-series'), 2, current_date - 16,
   'Paul prayed for the eyes of understanding to be enlightened. Revelation is received, not manufactured.',
   '<p>This is <strong>sample content</strong>. Replace it from the admin dashboard.</p><h2>The prayer of Paul</h2><p>Ephesians 1 gives us the pattern: revelation first, then the exceeding greatness of His power toward us who believe.</p>',
   '{faith,kingdom}', 'published', now() - interval '16 days', false),
  ('How the word of knowledge operates [sample]','word-of-knowledge-operates',
   (select id from public.series where slug='word-of-knowledge'), 1, current_date - 7,
   'A working, ordered introduction to the manifestation of the word of knowledge in an ordinary believer.',
   '<p>This is <strong>sample content</strong>. Replace it from the admin dashboard.</p><h2>Facts revealed, not invented</h2><p>The word of knowledge reveals what is; it never predicts what will be. Order matters.</p>',
   '{word-of-knowledge}', 'scheduled', now() + interval '3 days', false)
on conflict do nothing;

insert into public.teaching_links (teaching_id, label, url) values
  ((select id from public.teachings where slug='faith-that-moves-mountains'), 'Watch on YouTube','https://youtube.com/@prophetlawrencefiwara');

insert into public.schedule_sessions (day, title, type, start_time, end_time, description, join_url, active, sort_order) values
  (1,'Teaching / Convergence','Teaching','20:00','21:00','The week opens here. A full teaching from the Word, followed by ministry and convergence in prayer.','',true,1),
  (3,'Bible Study','Bible Study','21:00','22:00','Book by book, line by line. We stay in a passage until it is understood, not merely read.','',true,2),
  (5,'Prayer','Prayer','21:00','22:00','Intercession for the body, the nations and one another. Bring your requests; we stand together.','',true,3),
  (0,'Exhortation & Teaching','Teaching','18:00','19:00','A shorter weekend session: exhortation, questions and a word to carry into the week.','',true,4);

insert into public.events (title, slug, description, starts_at, ends_at, format, registration_required, status, recurrence, featured) values
  ('TSOP Anniversary Service [sample]','tsop-anniversary','The founding of The School of Prophets is remembered every 18 September with thanksgiving, worship and the word.', (extract(year from now())::text || '-09-18 18:00+01')::timestamptz, (extract(year from now())::text || '-09-18 20:00+01')::timestamptz, 'online', false, 'published', 'yearly', true),
  ('Prophetic Encounter Night [sample]','prophetic-encounter-night','An evening of worship, teaching and prophetic ministry. Bring a notebook.', (extract(year from now())::text || '-12-31 20:00+01')::timestamptz, (extract(year from now())::text || '-12-31 22:00+01')::timestamptz, 'online', true, 'published', 'none', false)
on conflict do nothing;

insert into public.call_types (name, slug, description, duration_minutes, buffer_minutes, mode, approval_required, sort_order) values
  ('Counselling / Prayer call','counselling-prayer','A personal call for prayer or counsel. [sample]', 30, 5, 'whatsapp', false, 1),
  ('Enrolment enquiry','enrolment-enquiry','Questions about joining the School of Prophets Bible Institute. [sample]', 20, 5, 'phone', false, 2),
  ('Ministry guidance','ministry-guidance','A longer session for those discerning a call to ministry. [sample]', 45, 10, 'meet', true, 3)
on conflict do nothing;

insert into public.availability_rules (weekday, start_time, end_time, slot_minutes) values
  (1,'10:00','13:00',30),(1,'15:00','17:00',30),
  (2,'10:00','13:00',30),(2,'15:00','17:00',30),
  (3,'10:00','13:00',30),(3,'15:00','17:00',30),
  (4,'10:00','13:00',30),(4,'15:00','17:00',30),
  (5,'10:00','12:00',30);

insert into public.site_settings (key, value) values
  ('enrolment', '{"status":"closed","cohortName":"Next cohort","cohortNote":"Dates and syllabus for the next cohort are announced in the community first.","deadline":null,"closedMessage":"Enrolment is currently closed. Join the waitlist and you will be told first when the next cohort opens.","waitlistOn":true,"feeText":"Costs are set per cohort and published with each enrolment window."}'),
  ('announcement', '{"active":false,"message":"","link":"","variant":"default"}'),
  ('homepage', '{"featuredTeachingSlug":null,"featuredSeriesSlug":"faith-series","featuredEventSlug":"tsop-anniversary","heroText":"","heroImageUrl":"","sections":[]}'),
  ('giving', '{"bankName":"","accountName":"","accountNumber":"","instructions":"","paystackEnabled":false,"paystackLink":""}'),
  ('contact', '{"whatsapp":"","telegram":"","facebookPage":"https://web.facebook.com/lawrence.iwara.581","facebookGroup":"https://web.facebook.com/groups/549551002660877","youtube":"https://youtube.com/@prophetlawrencefiwara","email":"","phone":"","address":""}'),
  ('pages', '{"about":"","prophet":""}'),
  ('legal', '{"privacy":"","terms":""}'),
  ('seo', '{"title":"","description":"","shareImage":"","analytics":""}')
on conflict (key) do nothing;

insert into public.faqs (question, answer, sort_order) values
  ('Are the gatherings free to join? [sample]','Yes. Every weekly gathering is free and online. A stable internet connection and a notebook are all you need.',1),
  ('Is the Bible Institute accredited? [sample]','The School of Prophets Bible Institute is a ministry training school, not a secular academic institution.',2),
  ('How do I join the community? [sample]','Use the WhatsApp or Telegram invite links on the Contact page.',3);

insert into public.team_members (name, role_label, bio, sort_order, visible) values
  ('Prophet Lawrence Iwara','Founder and overseer','The presiding prophet and teacher of The School of Prophets. [sample bio - replace]',1,true);

insert into public.gallery_albums (title, slug, description) values
  ('Gatherings [sample]','gatherings','Photos from weekly gatherings and events. [sample]');

insert into public.email_templates (key, label, subject, body) values
  ('confirmation','Submission confirmation','We received your message','Hello {{name}},\n\nThank you for reaching out to The School of Prophets. We have received your {{type}} and a member of the team will respond soon.\n\nThe School of Prophets'),
  ('acceptance','Application accepted','Welcome to The School of Prophets','Hello {{name}},\n\nYour application to The School of Prophets Bible Institute has been accepted. Details of the next steps and the cohort start date follow shortly.\n\nThe School of Prophets'),
  ('decline','Application declined','Update on your application','Hello {{name}},\n\nThank you for applying to The School of Prophets Bible Institute. After prayerful consideration we are not able to offer you a place in this cohort. You are welcome to apply again when enrolment reopens.\n\nThe School of Prophets'),
  ('waitlist_open','Waitlist enrolment open','Enrolment is now open','Hello {{name}},\n\nYou joined our waitlist earlier. Enrolment for the new cohort is now open and a limited number of places are available. Apply here: {{link}}\n\nThe School of Prophets'),
  ('reminder','Booking reminder','Reminder: your call with The School of Prophets','Hello {{name}},\n\nThis is a reminder of your call at {{time}}. {{link}}\n\nThe School of Prophets'),
  ('cancellation','Booking cancelled','Your call has been cancelled','Hello {{name}},\n\nYour call booked for {{time}} has been cancelled. Reason: {{reason}}. You can rebook at any time: {{link}}\n\nThe School of Prophets')
on conflict (key) do nothing;
