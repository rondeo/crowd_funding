pragma solidity ^0.5.8;

contract Funding_control {

    struct Backer {
        //uint backerId;
        address backerAddress;
        uint[] backedProject;
        uint[] voteProject;
    }

    enum Status {Initial, Funding, End, Agree, Disagree, Voting}
    struct Project {
        uint projectId;
        string projectName;
        uint startDate;
        uint endDate;
        uint fundraiserId;
        uint backerNum;
        uint voteNum;
        uint goal;
        uint raisedMoney;
        Status projectStatus;
    }

    struct Fundraiser {
        uint id;
        address payable fundraiserAddress;
        uint projectNum;
    }

    mapping(address => Backer) public backers;
    mapping(uint => Project) public projects;
    mapping(uint => Fundraiser) public fundraisers;

    uint public backersCount = 0;
    uint public projectsCount = 0;
    uint public fundraisersCount = 0;

    // Constructor
    constructor() public {
        newFundraiser();
        newProject("MOFT--世界第一款筆電隱形支架", 0, 0, 1, 2);
        newProject("PURUS Air i--全球最小的螺旋靜電空氣清淨機", 0, 0, 1, 5);
        newProject("ROLLS 瞬間捲收傘", 0, 0, 1, 3);
        newProject("nubo 藍鯨吸管", 0, 0, 1, 6);
        newProject("TEAMOSA 智慧泡茶機", 0, 0, 1, 100);
        newProject("Bagsmart 狂挺背包", 0, 0, 1, 80);
        newProject("MetroBag 城市生存包", 0, 0, 1, 3);
    }

    function newBacker() public {
        uint[] memory backedProjects;
        uint[] memory voteProjects;
        backers[msg.sender] = Backer(msg.sender, backedProjects, voteProjects);
    }

    function newProject(string memory _name, uint start, uint end, uint _fid, uint _goal) private {
        projects[++projectsCount] = Project(projectsCount, _name, start, end, _fid, 0, 0, _goal, 0, Status.Initial);
    }

    function newFundraiser() private {
        address payable fundraiser0 = 0xb6401624CeEA79088F71Aa2f42942fE0556cd2B6;
        fundraisers[++fundraisersCount] = Fundraiser(fundraisersCount, fundraiser0, 0);
    }

    // backers back the project
    function backProject(uint projectId, uint backedMoney) public payable {
        // check if the backed date is valid
        //require((curDate > projects[projectId].startDate && curDate < projects[projectId].endDate), "Not valid date!");
        projects[projectId].backerNum++;
        projects[projectId].raisedMoney += backedMoney;
        backers[msg.sender].backedProject.push(projectId);
    }

    // backer vote
    function voteProject(uint _projectId) public returns(bool, uint, uint) {
        require((_projectId >= 0 && _projectId <= projectsCount), "Invalid project!");
        bool isBacked = false;
        bool isVoted = false;
        for (uint i = 0; i < backers[msg.sender].backedProject.length; i++) {
            if (_projectId == backers[msg.sender].backedProject[i]) {
                isBacked = true;
                break;
            }
        }
        if (isBacked == false) revert("Not backed yet.");
        for (uint i = 0; i < backers[msg.sender].voteProject.length; i++) {
            if (_projectId == backers[msg.sender].voteProject[i]) {
                isVoted = true;
                break;
            }
        }
        if (isVoted == true) revert("Already voted!");

        projects[_projectId].voteNum++;
        return (updateProjectStatus(_projectId), projects[_projectId].voteNum, projects[_projectId].backerNum);
    }

    // check if proposal is agreed (yes: transfer money; no: reject the proposal)
    function updateProjectStatus(uint _projectId) private returns(bool) {
        require(_projectId >= 0 && _projectId <= projectsCount, "Invalid project!");
        if (projects[_projectId].voteNum * 2 >= projects[_projectId].backerNum && address(this).balance >= projects[_projectId].goal) {
            projects[_projectId].projectStatus = Status.Agree;
            return transferFund(_projectId);
        } else return false;
    }
    
    // transfer money to fundraiser
    function transferFund(uint _projectId) private returns (bool){
        require(address(this).balance >= projects[_projectId].goal, "Not enough money!");
        address payable fundraiser = fundraisers[projects[_projectId].fundraiserId].fundraiserAddress;
        fundraiser.transfer(projects[_projectId].goal * 1 ether);
        return true;
    }
    // reject proposal

    // check if project is expired
    /*function projectExpired(uint projectId, uint curDate) public {
        if (projects[projectId].endDate < curDate) {
            projects[projectId].projectStatus = Status.End;
        }
    }*/

}