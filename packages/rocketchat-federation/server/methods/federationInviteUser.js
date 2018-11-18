Meteor.methods({
	federationInviteUser(usernameWithIdentifier) {
		if (!Meteor.userId()) {
			return false;
		}

		const [username, identifier] = usernameWithIdentifier.split('@');

		const { federationPeerClient } = Meteor;

		if (!federationPeerClient) {
			throw new Meteor.Error('federation-not-registered', 'Looks like this server is not registered to the DNS server');
		}

		const federatedUser = federationPeerClient.findUser({ username, identifier });

		if (!federatedUser) {
			throw new Meteor.Error('federation-user-not-found', `Could not find a federated user:"${ usernameWithIdentifier }"`);
		}

		let user = null;

		try {
			const localUser = federatedUser.getLocalUser();

			// Delete the _id
			delete localUser._id;

			// Create the local user
			user = RocketChat.models.Users.create(localUser);
		} catch (err) {
			console.log(err);
		}

		return user;
	},
});