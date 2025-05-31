

can you please create a Dog Profile .ejs script?
based on this UserProfile.ejs script:



<!DOCTYPE html>
<html>
<head>
  <title><%= user.name %> | Dog Trading Profile</title>
</head>
<body style="font-family: sans-serif; margin: 0; padding: 0;">

  <%- include('../shared/Header') %>

  <main style="padding: 2rem; max-width: 600px; margin: auto;">

    <h1>
      <%= user.name ? user.name : "Unnamed User" %>'s Profile
    </h1>

    <p><strong>Email:</strong> <%= user.email %></p>

    <% if (myProfile) { %>
      <div style="margin-top: 2rem; background-color: #eef; padding: 1rem; border: 1px solid #ccc;">
        <h2>This is your profile 👤</h2>
        <p>You can edit your info or manage your dogs and trades here in the future.</p>
        <!-- <a href="/editProfile">Edit Profile</a> (for future) -->
      </div>
    <% } else { %>
      <div style="margin-top: 2rem; padding: 1rem; background-color: #f9f9f9; border: 1px solid #ddd;">
        <p>You are viewing <%= user.name || "this user's" %> public profile.</p>
      </div>
    <% } %>

  </main>

</body>
</html>



Here's the code that gives the .ejs its information in express

    route.either("GET /DogProfile/:dogId", async({user, params, userId, page})=>{
        let pageDog = await Dog.findOne({ _id: params.userId });
        pageDog = pageDog.lean();
        let dogOwner = await Owner.findOne({ _id: pageDog.owner });
        dogOwner = dogOwner.lean();
        pageDog.owner = dogOwner;
        pageDog.ownerLink = `/UserProfile/${dogOwner._id}`;

        return page(200, "display/DogProfile", {
            user, userId, myDog:userId === params.userId,
            dog: pageDog
        });
    });




The "dog" object given to DogProfile, has:

- 'dog.name'
- 'dog.profile' picture
- owned by: 'dog.owner.name'
- link to owner's page 'dog.ownerLink' when clicking the owner name
- 'traded' true false value that says if the dog has an offer up or not

Can you please create the DogProfile page?