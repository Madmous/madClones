import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import * as boardActions from './board';

import reducer from './board';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('board actions', () => {
  describe('MODAL', () => {
    it('should create open modal action', () => {
      const expectedAction = {
        type: 'OPEN_MODAL'
      };

      expect(boardActions.openModal()).toEqual(expectedAction)
    })

    it('should create open modal action', () => {
      const expectedAction = {
        type: 'CLOSE_MODAL'
      };

      expect(boardActions.closeModal()).toEqual(expectedAction)
    })

    it('should handle OPEN_MODAL', () => {
      const payload = {
        isModalOpen: true
      }; 

      expect(
        reducer([], {
          type: 'OPEN_MODAL'
        })
      ).toEqual({
          isModalOpen: true
        }
      )
    })

    it('should handle CLOSE_MODAL', () => {
      const payload = {
        isModalOpen: false
      }; 

      expect(
        reducer([], {
          type: 'CLOSE_MODAL'
        })
      ).toEqual({
          isModalOpen: false
        }
      )
    })
  })

  describe('BOARDS', () => {
    it('should create update boards action', () => {
      const payload = {}; 
      const expectedAction = {
        type: 'UPDATE_BOARDS',
        payload
      };

      expect(boardActions.updateBoards(payload)).toEqual(expectedAction)
    })
    
    it('should handle UPDATE_BOARDS', () => {
      const payload = {
        boards: [{
          _id: '1',
          isStarredBoard: true,
          name: 'boardName'
        }]
      }; 

      expect(
        reducer([], {
          type: 'UPDATE_BOARDS',
          payload
        })
      ).toEqual({
          boards: payload.boards
        }
      )
    })
  })

  describe('BOARDS_MENU', () => {
    it('should create openBoardsMenu action', () => {
      const expectedAction = {
        type: 'OPEN_BOARDS_MENU'
      };

      expect(boardActions.openBoardsMenu()).toEqual(expectedAction)
    })

    it('should create closeBoardsMenu action', () => {
      const expectedAction = {
        type: 'CLOSE_BOARDS_MENU'
      };

      expect(boardActions.closeBoardsMenu()).toEqual(expectedAction)
    })

    it('should handle OPEN_BOARDS_MENU', () => {
      expect(
        reducer([], {
          type: 'OPEN_BOARDS_MENU'
        })
      ).toEqual({
          isBoardsMenuOpen: true
        }
      )
    })

    it('should handle CLOSE_BOARDS_MENU', () => {
      expect(
        reducer([], {
          type: 'CLOSE_BOARDS_MENU'
        })
      ).toEqual({
          isBoardsMenuOpen: false
        }
      )
    })
  })
})

describe('board reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual({
        isFetchingBoardSuccessful: false,
        isBoardsMenuOpen: false,
        isFetchingBoard: false,
        isModalOpen: false,

        errorMessage: '',

        boards:[]
      }
    )
  })
})

describe('board async actions', () => {
  afterEach(() => {
    nock.cleanAll();
  })
  
  describe('ADD_BOARD', () => {
    it('should create an addBoard action - organization board', () => {
      const data = {
        boards: [],
        organizations: []
      };

      const expectedActions = [
        { type: 'ADD_BOARD_REQUEST' },
        { type: 'CLOSE_ALL_MODALS' }, 
        { type: 'ADD_BOARD_SUCCESS' }, 
        {
          type: 'UPDATE_BOARDS',
          payload: data
        },
        {
          type: 'UPDATE_ORGANIZATIONS',
          payload: data
        }
      ];

      const store = mockStore();

      nock('http://localhost:3001/api/v1/boards', {
        body: JSON.stringify({
          name: 'boardName'
        })}, { 
        reqheaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'authorization': 'JWT ' + localStorage.getItem('userId')
        }
      })
      .post('')
      .reply(200, { data });

      return store.dispatch(boardActions.addBoard('userId', null, 'boardName'))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions)
        }
      );
    })

    it('should create an addBoard action - organization board - fail', () => {
      const data = {
        uiError: [ 'There was an error adding the board' ]
      };

      const expectedActions = [
        { type: 'ADD_BOARD_REQUEST' },
        { 
          type: 'ADD_BOARD_FAIL',
          payload: data
        },
        {
          type: 'UPDATE_NOTIFICATION',
          payload: data.uiError
        }
      ];

      const store = mockStore();

      nock('http://localhost:3001/api/v1/organizations/orgId/boards/', {
        body: JSON.stringify({
          name: 'boardName'
        })}, { 
        reqheaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'authorization': 'JWT ' + localStorage.getItem('userId')
        }
      })
      .post('')
      .reply(400, { data });

      return store.dispatch(boardActions.addBoard('userId', 'orgId', 'boardName'))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions)
        }
      );
    })

    it('should create an addBoard action - personal board - success', () => {
      const data = {
        boards: [],
        organizations: []
      };

      const expectedActions = [
        { type: 'ADD_BOARD_REQUEST' },
        { type: 'CLOSE_ALL_MODALS' }, 
        { type: 'ADD_BOARD_SUCCESS' }, 
        {
          type: 'UPDATE_BOARDS',
          payload: data
        },
        {
          type: 'UPDATE_ORGANIZATIONS',
          payload: data
        }
      ];

      const store = mockStore();

      nock('http://localhost:3001/api/v1/organizations/orgId/boards/', {
        body: JSON.stringify({
          name: 'boardName'
        })}, { 
        reqheaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'authorization': 'JWT ' + localStorage.getItem('userId')
        }
      })
      .post('')
      .reply(200, { data });

      return store.dispatch(boardActions.addBoard('userId', 'orgId', 'boardName'))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions)
        }
      );
    })

    it('should handle ADD_BOARD_REQUEST', () => {
      expect(
        reducer([], {
          type: 'ADD_BOARD_REQUEST'
        })
      ).toEqual({
          isFetchingBoard: true
        }
      )
    })

    it('should handle ADD_BOARD_SUCCESS', () => {
      expect(
        reducer([], {
          type: 'ADD_BOARD_SUCCESS'
        })
      ).toEqual({
          isFetchingBoardSuccessful: true,
          isFetchingBoard: false
        }
      )
    })

    it('should handle ADD_BOARD_FAIL', () => {
      expect(
        reducer([], {
          type: 'ADD_BOARD_FAIL',
          payload: {
            error : 'Please enter a board name'
          }
        })
      ).toEqual({
          isFetchingBoardSuccessful: false,
          isFetchingBoard: false,
          errorMessage: 'Please enter a board name'
        }
      )
    })
  })
})