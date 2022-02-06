pragma solidity ^0.5.0;

contract Contest {

    //solidity Structure data type;

    //creating struct to model the contestant
    struct Contestant {
        uint id;
        string name;
        uint voteCount;
    }

    //Use mapping to get or fetch the contestant details
    mapping(uint => Contestant) public contestants;

    //A count to keep track of the number of the contestants count
    uint public contestantsCount;

    //save the list of users who already casted a vote
    mapping(address => bool) public voters;


    constructor() public {
        addContestant("Innocent");
        addContestant("Mithu");
        addContestant("George");
    }

    event votedEvent(uint indexed _contestantId);

    //Since you can't get the length of an array in solidity
    //You can keep track of the number of items in the

    //add a function to add contestant
    function addContestant (string memory _name) private {
        contestantsCount++;
        contestants[contestantsCount] = Contestant(contestantsCount, _name, 0);
    }

    function vote(uint _contestantId) public {

        //restricting the person from casting another vote using require
        require(!voters[msg.sender]);

        //require that the addContestant value be added to the correct contestant
        require(_contestantId > 0 && _contestantId<= contestantsCount);

        //increase the contestant vote
        contestants[_contestantId].voteCount ++;

        //save the voter's vote
        voters[msg.sender] = true;

        //trigger the vote event
        emit votedEvent(_contestantId);
    }

}
