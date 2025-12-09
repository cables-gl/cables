Socket Cluster Topic Info gives you information about active clients that are subscribed to a topic.

"active" is defined by the "timeout" parameter, clients that didn't send a message for longer than the timeout will be considered inactive.

after the "soft timeout" clients will be moved to the soft timeout list (and kept in active) until they either reach the full timeout and are deemed inactive or send another message.

if a client has been considered inactive and then sends a new message, it will be moved from the inactive state to active again.

updates and checks happen on every message received and can be manually triggered by the "update" trigger. please be advised that most of this runs asynchronously, so (i.e.) do not count on the timeout progress ending at 1 exactly (might be lower).

the own client appears in NONE of these lists.