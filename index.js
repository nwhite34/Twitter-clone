import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let loggedInUser = "YourUsername";

// Retrieve tweets from localStorage or use an empty array if no data exists
let tweetsData = JSON.parse(localStorage.getItem('tweetsData')) || [];

document.addEventListener('DOMContentLoaded', function () {
    const tweetBtn = document.getElementById('tweet-btn');
    const tweetInput = document.getElementById('tweet-input');

    tweetBtn.addEventListener('click', handleTweetBtnClick);

    function handleTweetBtnClick() {
        const tweetText = tweetInput.value.trim();

        if (tweetText) {
            const newTweet = {
                handle: loggedInUser,
                profilePic: 'images/scrimbalogo.jpg',
                likes: 0,
                retweets: 0,
                tweetText: tweetText,
                replies: [],
                isLiked: false,
                isRetweeted: false,
                uuid: uuidv4()
            };

            tweetsData.unshift(newTweet);
            localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
            render();
            tweetInput.value = '';
        }
    }

    render();
});

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like);
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet);
    } else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply);
    } else if (e.target.dataset.delete) {
        handleDeleteClick(e.target.dataset.delete);
    } else if (e.target.classList.contains('reply-btn')) {
        handleReplyBtnClick(e.target.dataset.reply);
    } else if (e.target.dataset.replyDelete) {
        const tweetId = e.target.dataset.replyDelete;
        const replyId = e.target.dataset.replyId;
        handleDeleteClick(tweetId, replyId);
    }
});

function handleLikeClick(tweetId) {
    const targetTweetObj = tweetsData.find(function (tweet) {
        return tweet.uuid === tweetId;
    });

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--;
    } else {
        targetTweetObj.likes++;
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked;
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
    render();
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = tweetsData.find(function (tweet) {
        return tweet.uuid === tweetId;
    });

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--;
    } else {
        targetTweetObj.retweets++;
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
    render();
}

function handleReplyClick(replyId) {
    const replySection = document.getElementById(`replies-${replyId}`);
    replySection.classList.toggle('hidden');

    const replyInput = replySection.querySelector('.reply-input input');
    replyInput.focus();

    handleReplyBtnClick(replyId); // Call the function to display the value immediately
}

function handleDeleteClick(tweetId, replyId) {
    if (replyId) {
        const targetTweetObj = tweetsData.find(function (tweet) {
            return tweet.uuid === tweetId;
        });
        targetTweetObj.replies = targetTweetObj.replies.filter(function (reply) {
            return reply.uuid !== replyId;
        });
    } else {
        tweetsData = tweetsData.filter(function (tweet) {
            return tweet.uuid !== tweetId;
        });
    }

    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
    render();
}

function handleReplyBtnClick(tweetId) {
    const replyInput = document.getElementById(`reply-input-${tweetId}`);
    const replyText = replyInput.value.trim();

    if (replyText) {
        const replyTweet = {
            handle: loggedInUser,
            profilePic: 'images/scrimbalogo.jpg',
            likes: 0,
            retweets: 0,
            tweetText: replyText,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        };

        const targetTweetObj = tweetsData.find(function (tweet) {
            return tweet.uuid === tweetId;
        });

        targetTweetObj.replies.unshift(replyTweet);
        localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
        render();
        replyInput.value = '';
        console.log('Reply:', replyText); // Display the value in the console
    }
}

function getReplyHtml(replies, tweetId) {
    let repliesHtml = '';

    if (replies.length > 0) {
        replies.forEach(function (reply) {
            repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${reply.handle}</p>
            <p class="tweet-text">${reply.tweetText}</p>
        </div>
    </div>
    ${reply.handle === loggedInUser
                    ? `<div class="delete-reply">
                <i class="fa-solid fa-trash"
                data-reply-delete="${tweetId}"
                data-reply-id="${reply.uuid}"
                ></i>
            </div>`
                    : ''
                }
</div>
`;
        });
    }

    return repliesHtml;
}

function getFeedHtml() {
    let feedHtml = '';

    tweetsData.forEach(function (tweet) {
        let likeIconClass = '';

        if (tweet.isLiked) {
            likeIconClass = 'liked';
        }

        let retweetIconClass = '';

        if (tweet.isRetweeted) {
            retweetIconClass = 'retweeted';
        }

        const repliesHtml = getReplyHtml(tweet.replies, tweet.uuid);

        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                ${tweet.handle === loggedInUser
                ? `<span class="tweet-detail">
                            <i class="fa-solid fa-trash"
                            data-delete="${tweet.uuid}"
                            ></i>
                        </span>`
                : ''
            }
            </div>
        </div>
    </div>
    <div class="replies-section hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
        <div class="reply-input">
            <input type="text" id="reply-input-${tweet.uuid}" placeholder="Reply to this tweet">
            <button class="reply-btn" data-reply="${tweet.uuid}">Reply</button>
        </div>
    </div>
</div>
`;
    });

    return feedHtml;
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml();
}

// Add the following code to populate local storage with data from data.js
// Modify the file path to data.js based on your project structure
fetch('./data.js')
    .then(response => response.json())
    .then(data => {
        tweetsData = data;
        localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
        render();
    })
    .catch(error => console.log('Error fetching data:', error));

render();
