
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type User = Principal;

  public type UserProfile = {
    name : Text;
  };

  public type Contact = {
    name : Text;
    phone : Text;
    relationship : Text;
    whatsappPhone : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Persistent storage for contacts, mapped by user.
  let contacts = Map.empty<User, Map.Map<Text, Contact>>();
  // Persistent storage for favorite locations, mapped by user.
  let favoriteLocations = Map.empty<User, Text>();

  // User profile management functions required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Function to add a new contact for the caller. Creates contact map if user is new.
  public shared ({ caller }) func addContact(contact : Contact) : async () {
    // Verifies that the user has the required permissions to add contacts.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add contacts");
    };

    let userContacts = switch (contacts.get(caller)) {
      case (null) { Map.empty<Text, Contact>() };
      case (?existingContacts) { existingContacts };
    };

    // Check if phone number already exists
    if (userContacts.values().any(func(c) { c.phone == contact.phone })) {
      Runtime.trap("Contact with the same phone number already exists");
    };

    userContacts.add(contact.name, contact);
    contacts.add(caller, userContacts);
  };

  // Function to update an existing contact for the caller
  public shared ({ caller }) func updateContact(name : Text, contact : Contact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update contacts");
    };

    switch (contacts.get(caller)) {
      case (null) { Runtime.trap("Cannot update a non-existent contact") };
      case (?userContacts) {
        if (not userContacts.containsKey(name)) {
          Runtime.trap("Contact not found - update failed");
        };

        // Check if the new phone number conflicts with another contact (excluding the current one)
        if (name != contact.name) {
          if (userContacts.values().any(func(c) { c.name != name and c.phone == contact.phone })) {
            Runtime.trap("Contact with the same phone number already exists");
          };
        } else {
          if (userContacts.values().any(func(c) { c.name != name and c.phone == contact.phone })) {
            Runtime.trap("Contact with the same phone number already exists");
          };
        };

        // If name changed, remove old entry
        if (name != contact.name) {
          userContacts.remove(name);
        };

        userContacts.add(contact.name, contact);
        contacts.add(caller, userContacts);
      };
    };
  };

  // Function to remove a contact by name. Handles cases where contact does not exist.
  public shared ({ caller }) func removeContact(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can remove contacts");
    };

    switch (contacts.get(caller)) {
      case (null) { Runtime.trap("Cannot remove a non-existent contact") };
      case (?userContacts) {
        if (not userContacts.containsKey(name)) {
          Runtime.trap("Contact not found - removal failed");
        };
        userContacts.remove(name);
        contacts.add(caller, userContacts);
      };
    };
  };

  // Function to retrieve all contacts for the caller.
  public query ({ caller }) func getContacts() : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can fetch contacts");
    };

    switch (contacts.get(caller)) {
      case (null) { [] };
      case (?userContacts) { userContacts.values().toArray() };
    };
  };

  // Function to add a favorite location for the caller.
  public shared ({ caller }) func addLocation(location : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add locations");
    };

    favoriteLocations.add(caller, location);
  };

  // Function to retrieve the caller's favorite location (fixed authorization bug).
  public query ({ caller }) func getLocations() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can fetch favorite locations");
    };

    // Fixed: Return only the caller's location, not all users' locations
    switch (favoriteLocations.get(caller)) {
      case (null) { [] };
      case (?location) { [location] };
    };
  };
};
