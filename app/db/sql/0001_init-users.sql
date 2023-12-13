-- -- -- Migration number: 0001 	 2023-11-06T02:33:20.298Z

INSERT INTO user (id, name, email, emailVerified, image, created_at, updated_at) 
VALUES (
    1,
    'Carlos Soriano',
    'soriano.carlitos@gmail.com',
    NULL, -- Assuming emailVerified should be NULL
    'https://avatars.githubusercontent.com/u/28075512?v=4',
    '2023-11-12 19:00:32',
    '2023-11-12 19:00:32'
);

-- INSERT INTO account (
--     id,
--     userId,
--     type,
--     provider,
--     providerAccountId,
--     refresh_token,
--     access_token,
--     expires_at,
--     token_type,
--     scope,
--     id_token,
--     session_state,
--     created_at,
--     updated_at
-- ) VALUES (
--     1,
--     1,
--     'oauth',
--     'github',
--     '28075512',
--     NULL, -- Assuming refresh_token should be NULL
--     NULL, -- Assuming access_token should be NULL
--     NULL, -- Assuming expires_at should be NULL
--     'bearer',
--     'read:user,user:email',
--     NULL, -- Assuming id_token should be NULL
--     NULL, -- Assuming session_state should be NULL
--     '2023-11-12 19:00:32',
--     '2023-11-12 19:00:32'
-- );

-- -- DELETE FROM user WHERE id = 1;
-- -- select * from user;
