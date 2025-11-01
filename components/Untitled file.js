<PostCard
            post={item}
            currentUser={currentUser}
            onDelete={isOwnProfile ? () => handleDeletePost(item.id) : null}
            onLike={(postId, emoji) => handleLike(postId, emoji)}
            onComment={(postId, text) => handleAddComment(postId, text)}
            navigation={navigation}
            showCustomThemes={true}
            theme={user?.theme || {}}
          />