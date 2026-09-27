-- SPEC 10 — Paso 8: migración de hotlinks a Storage (site-images).
-- Generado automáticamente por scripts/migrate-images.ts
-- Si una descarga falló, images.url conserva el hotlink original (fallback documentado).

insert into public.images (key, storage_path, url, alt)
values ('hero', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKaearigWhLy1U-xRq1hRmMDKoiTT8JXAe3p8qC9WFn0sffFBNu_k5m7r08bihl9iGjdtHrP8kxhUc7jUlry3j8AgXmasDyFoXE-U6MSYH34hJXFrEE59c0oiU_-wk8u9wkNNYy4IU4QYIs816f7UyKx76IOmKjcggTn1QTpOocWWvRj5tX0Aqh2KoZEcC6qnOG4tIzghm48GuzuuC0IasEOqPGX99rphjTKl-Y8dAeRKAIhq4nfjt', 'Interior arquitectónico minimalista cinematográfico con luz terracota cálida')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('portrait', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCCTrXMpPUglLzlsOZKeAEfVB2gXQyCEpCZqCm6ai0ED5YDTkquWKgHPGogMv2tN7IkYmSPYnEXzeLVip5Sr3sV1yE76ZINbwFcaNckOX87pL3pk0xfXSdkAKuZojGSXIZe1opoIoG0JpKA9wDrNeEIfRpN1OEO-xh0B_Q3UzcogVo5Vpb8a2zK-QQcEFnK5C69kkhyXlINhfNxI8JTB4T4xVzdI3yq2dQPIjZHN6HumS6zezDOV18', 'Retrato de estudio de JMMC, director creativo e ingeniero de software')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('project-01', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWsxf0NpdttfMh88wqA27BcA2N91szgUCHrXm0WKeZRI-4cY0mia3KjNHoj5WfKN97nogArOTNS7O4DmVND2mcBQYvvk0QOBwQh36oBB5URP8UuHDhTu8ahDv0OVo8VCd2JrKisB3mP4n8qYd1wxi_mxruGck29XArScJg3EdK2nbp7zLmqLHfY6tJMXt_xRYEqGHLm8b8gmfmDvHhQ4X2S7hxqsF9KpufjfAiGy9qhMvS-BuLSob_', 'Kaelo Platform — FinTech Analytics')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('project-02', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9k4qs3b5soYOUu4rSOx-H3WuHEXUPL7Wk0XVhtTlEYp6x9jsIb7x94iFCMqnmnDyo_GBs-T921DnYJTmH1r9niz9SLQkucAEz3fm6VE1nzqf9TwplpSlltRkWGh5JglSm6EJl31-bnzJv4e-HN-a4rnjh-W_A-EpyZwGtbl01Q7wSO_9qeAt6g8iafxCXXt53qqcmI7xpVxrJVIukRqOTK89Rcx5o70akWbDDfW6Gtz6QIRdoaBmT', 'Atelier Solstice — E-Commerce Editorial')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('project-03', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhuloIhMHnCLkNDQCnrfaVmYtN29dTEYagaUBSrbUbJvnSPL_AnyPvheRX6nJxQCZHjKavUSpRuOmVtXsQbkyymURHRt8qSeowMsG7ymYu21SDju-FZJThnhzGONPHyvFklbRDFQrCh0G_FN2qYVvcPnQqbW2wgjpyyTUjpVps3ajRRFmGmTdAJ_S2RPBtEJdNIzo_y_d5t7AN0sMIarYRMLKjzeA8vn4m4uogJqneIVbXA21fDt-U', 'Synapse Core — Automation & AI')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('project-04', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6HyLhe5Cspiyu7361jOmlB_ODIvaP94ak03_XyKwkFOv1-RmxMwm0_Qjkcke_ybdSyZ5stuosh1HGweScCpQ4x_EEKrh_B_v01SR1VG4IrOONK6T8ogIK6M8CiWriIs5JRhm8vCg1UNWmI95vKeW7XRSz6JCHPP1SCYgL_UBQIivQ2eZtrXaB8_6hlLoV5mlbNxFQzEx0V-xwrp6eVajUXE3_ih8TWw2pNjd4n4pHnxF0TA3wMsRY', 'Vesta Workspace — SaaS Enterprise')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('post-featured', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1UO2FHCD-wkO_dY6JY0L7R65GCyKN3eEM2gaJO2hd1oAErNKrvfcl2TMbXSgYLrgEBOYMRU1jx56AT2hNSu8auI3NF-_J_gnzUc1dB3ZjIzWbSR8vXCH3ayPavWis5RleyJMsKqFUNRZ7bDmEH3WdmSy1kStlL-7uO7yCJrWlmT7QIenvgf3RhYdvxmBFHh9b72_l-QH-GwHuTuLzbCjdwvu6Hua9FxAi3BcTJ6JQbAZflgxPbUO2', 'Cuaderno de especímenes tipográficos sobre mesa de arquitecto')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('post-css', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWsxf0NpdttfMh88wqA27BcA2N91szgUCHrXm0WKeZRI-4cY0mia3KjNHoj5WfKN97nogArOTNS7O4DmVND2mcBQYvvk0QOBwQh36oBB5URP8UuHDhTu8ahDv0OVo8VCd2JrKisB3mP4n8qYd1wxi_mxruGck29XArScJg3EdK2nbp7zLmqLHfY6tJMXt_xRYEqGHLm8b8gmfmDvHhQ4X2S7hxqsF9KpufjfAiGy9qhMvS-BuLSob_', 'Kaelo Platform — FinTech Analytics')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;

insert into public.images (key, storage_path, url, alt)
values ('post-ollama', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhuloIhMHnCLkNDQCnrfaVmYtN29dTEYagaUBSrbUbJvnSPL_AnyPvheRX6nJxQCZHjKavUSpRuOmVtXsQbkyymURHRt8qSeowMsG7ymYu21SDju-FZJThnhzGONPHyvFklbRDFQrCh0G_FN2qYVvcPnQqbW2wgjpyyTUjpVps3ajRRFmGmTdAJ_S2RPBtEJdNIzo_y_d5t7AN0sMIarYRMLKjzeA8vn4m4uogJqneIVbXA21fDt-U', 'Synapse Core — Automation & AI')
on conflict (key) do update set
  storage_path = excluded.storage_path,
  url = excluded.url,
  alt = excluded.alt;
